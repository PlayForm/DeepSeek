/**
 * @module Storage
 *
 * The CCR hook's own storage-domain open, recovery and write mirror.
 *
 * @remarks
 * Pattern P4 of Temporary/Harness-Wave/Plan.md section 6; the shipped
 * sequence copied from
 * hook-dsh-workspace-observe/Source/Function/Storage.ts:51-103.
 *
 * THE DOMAIN: a NEW domain `ccr_store` (version 1, layout per-record,
 * invalidRecords backup-and-skip, ONE table `entries`), NOT extension
 * records in a shared domain (a shared-domain extension would force a
 * version bump whose blast radius is that domain's whole family; the
 * single-layout parser enforces EXACT version equality, so version 1
 * declares no compatible predecessors). The row is the SAME projection the
 * JSONL journal serializes - {hash, type, size, ttlAt, payload}, payload =
 * base64 of the content's JSON serialization (Function/Store.ts:221-228) -
 * so the record schema and both decode paths stay one shape.
 *
 * BEST-EFFORT AND DETACHED: the open is kicked off from the plugin's own
 * effect with `void`, every failure is contained here. An ABSENT facility
 * is a SILENT SKIP (no log line, no record; the store keeps its existing
 * JSONL journal path - the documented recovery fallback for one release). A
 * PRESENT facility whose open fails is LOUD: one best-effort ledger line
 * `storage open failed: <reason>` (the P5 v2 incident posture, never
 * rethrown), and the store keeps its existing file path unchanged.
 *
 * THE RECOVERY (once, on open): the loaded `entries` records seed the
 * store's live map with the Store.Load semantics (createdAt/lastAccessed
 * restart at now, expired records are dropped exactly like the journal
 * compaction). When the table is EMPTY and the old JSONL journal exists,
 * its surviving records seed the domain table FIRST (the one-time
 * migration; the file itself is never rewritten here, so a deployment that
 * never opens the facility keeps working byte-for-byte). Entries the LRU
 * evicts later cannot be deleted through the handle's structural surface
 * (put + entries only, the precedent's shape), so a budget eviction may be
 * resurrected on the next recovery - the store's own TTL sweep and LRU
 * drop it again on the next insert, and no model-visible behavior changes.
 *
 * THE WRITE MIRROR: the store's Put is shadowed with an own-property
 * wrapper (Function/Apply owns State.Store; Function/Store.ts is outside
 * this lane's file list), so every future store insert is put into the
 * domain fire-and-forget while the file journal keeps dual-writing - the
 * fallback stays fresh for one release. The wrapper passes through untouched
 * once the handle is closed.
 *
 * The dynamic imports keep the optional packages off the module-load path
 * (a module-level import of an unresolvable package would crash the whole
 * bundle load - the factory's live-verified pitfall); the type-only
 * devDependencies pin them to the host-era versions.
 */
import * as FileSystem from "node:fs";

import type { Eviction } from "@Function/Store.js";
import type Entry from "@Interface/Entry.js";
import type State from "@Interface/State.js";

/**
 * The structural handle shape (the precedent's view: only `put` and
 * `entries` are consumed on the tables; `close` is kept for the effect's
 * disposer).
 */
type Handle = {
	close(): Promise<void>;
	table(name: string): {
		put(key: string, value: unknown): Promise<void>;
		entries(): IterableIterator<[string, unknown]>;
	};
};

/**
 * The currently open domain handle (one per apply; replaced on re-open).
 */
let Current: Handle | undefined;

/**
 * The domain row: the journal projection the JSONL file also serializes -
 * the store Entry with its content replaced by the base64 payload.
 */
type Row = {
	hash: string;
	type: string;
	size: number;
	ttlAt: number;
	payload: string;
};

/**
 * The journal projection encode - byte-identical with Function/Store's.
 */
const encode = (Row: Entry): string =>
	JSON.stringify({
		hash: Row.hash,
		type: Row.type,
		size: Row.size,
		ttlAt: Row.ttlAt,
		payload: Buffer.from(JSON.stringify(Row.content), "utf8").toString("base64"),
	});

/**
 * The inverse of the payload projection; null when the payload is missing
 * or undecodable.
 */
const decode = (Payload: unknown): Entry["content"] | null => {
	try {
		switch (true) {
			case typeof Payload !== "string":
				return null;
		}
		return JSON.parse(Buffer.from(Payload, "base64").toString("utf8"));
	} catch {
		return null;
	}
};

/**
 * The structural validation filter (a record that fails it is skipped,
 * never guessed).
 */
const Valid = (Row: unknown): boolean => {
	const Record = Row as Partial<Row> | null;
	return (
		Record !== null &&
		typeof Record === "object" &&
		typeof Record.hash === "string" &&
		typeof Record.type === "string" &&
		typeof Record.size === "number" &&
		typeof Record.ttlAt === "number" &&
		decode(Record.payload) !== null
	);
};

/**
 * Seed one validated record into the store's live map (the Store.Load
 * semantics: createdAt/lastAccessed restart at now, expired records are
 * dropped like the journal compaction, a hash already loaded by the
 * store's own boot read is never double-counted).
 */
const Seed = (State: State, Row: Row): void => {
	const Now = Date.now();
	switch (true) {
		case Now >= Row.ttlAt:
			return;
		case State.Store.Entries.has(Row.hash):
			return;
	}
	const Content = decode(Row.payload);
	if (Content === null) {
		return;
	}
	const Loaded: Entry = {
		hash: Row.hash,
		type: Row.type,
		size: Row.size,
		content: Content,
		createdAt: Now,
		ttlAt: Row.ttlAt,
		lastAccessed: Now,
	};
	State.Store.Entries.set(Loaded.hash, Loaded);
	State.Store.Bytes += Loaded.size;
};

/**
 * The old-file recovery fallback (one release): when the domain table is
 * EMPTY and the store's expanded journal path exists, its surviving
 * records seed the domain table (the one-time migration) and the store's
 * live map. The file itself is never rewritten here - the store's own
 * boot Load already compacted it before this open runs.
 */
const RecoverFile = async (State: State, Handle: Handle): Promise<void> => {
	const Table = Handle.table("entries");
	switch (true) {
		case [...Table.entries()].length > 0:
			return;
		case State.Store.Path === "":
			return;
	}
	let Raw: string;
	try {
		Raw = FileSystem.readFileSync(State.Store.Path, "utf8");
	} catch {
		return;
	}
	const Now = Date.now();
	for (const Line of Raw.split("\n")) {
		try {
			const Record = JSON.parse(Line) as {
				hash?: unknown;
				type?: unknown;
				size?: unknown;
				ttlAt?: unknown;
				payload?: unknown;
			};
			switch (true) {
				case typeof Record.hash !== "string" ||
					typeof Record.ttlAt !== "number" ||
					Now >= Record.ttlAt:
					continue;
			}
			const Content = decode(Record.payload);
			if (Content === null) {
				continue;
			}
			const Loaded: Entry = {
				hash: Record.hash,
				type: typeof Record.type === "string" ? Record.type : "default",
				size:
					typeof Record.size === "number"
						? Record.size
						: Buffer.byteLength(JSON.stringify(Content)),
				content: Content,
				createdAt: Now,
				ttlAt: Record.ttlAt,
				lastAccessed: Now,
			};
			await Table.put(Loaded.hash, JSON.parse(encode(Loaded)));
			Seed(State, JSON.parse(encode(Loaded)) as Row);
		} catch {
			/* a corrupt line is dropped, never fatal */
		}
	}
};

/**
 * The domain recovery: the loaded records seed the store's live map; a
 * record that fails validation is skipped, never guessed.
 */
const RecoverDomain = (State: State, Handle: Handle): void => {
	for (const [, Row] of Handle.table("entries").entries()) {
		switch (true) {
			case Valid(Row):
				Seed(State, Row as Row);
				break;
		}
	}
};

/**
 * The write mirror: one fire-and-forget put per store insert (best-effort,
 * never on the caller path - the store must never break dispatch).
 */
const Mirror = (Handle: Handle, Row: Entry): void => {
	try {
		void Handle.table("entries")
			.put(Row.hash, JSON.parse(encode(Row)))
			.catch(() => {
				/* mirror writes best-effort */
			});
	} catch {
		/* mirror writes best-effort */
	}
};

/**
 * Shadow the store's Put with an own-property wrapper: the original LRU +
 * TTL + journal behavior runs first, then the mirror. The wrapper becomes
 * a pass-through once the handle is closed (Current is cleared).
 */
const ShadowPut = (State: State): void => {
	const Store = State.Store;
	const Original = Store.Put.bind(Store);
	Store.Put = (Row: Entry): Eviction[] => {
		const Evicted = Original(Row);
		const Handle = Current;
		switch (true) {
			case Handle !== undefined:
				Mirror(Handle, Row);
				break;
		}
		return Evicted;
	};
};

/** Open the CCR hook's own domain (best-effort, never awaited by the
 *  caller: an absent facility is the effect's silent skip, a failed open is
 *  the one ledger line below). */
export default async (State: State, Facility: unknown): Promise<void> => {
	// A previous handle (an HMR reload re-ran apply) is closed first.
	const Previous = Current;
	if (Previous !== undefined) {
		Current = undefined;
		void Previous.close().catch(() => {
			/* close best-effort */
		});
	}
	try {
		const [Domain, Zod] = await Promise.all([
			import("@deepseek-ai/dsh-storage-domain"),
			import("zod"),
		]);
		const Record = Zod.object({
			hash: Zod.string(),
			type: Zod.string(),
			size: Zod.number(),
			ttlAt: Zod.number(),
			payload: Zod.string(),
		});
		const Handle = await (
			Facility as {
				open(spec: object): Promise<Handle>;
			}
		).open(
			Domain.defineDomain({
				name: "ccr_store",
				version: 1,
				layout: "per-record",
				invalidRecords: "backup-and-skip",
				tables: {
					entries: Domain.domainTable(
						Record as unknown as Parameters<typeof Domain.domainTable>[0],
					),
				},
			}),
		);
		Current = Handle;
		// Recovery: the domain's records first, then the old file as the
		// fallback seed when the table is empty.
		RecoverDomain(State, Handle);
		await RecoverFile(State, Handle);
		// The write mirror for the rest of the release.
		ShadowPut(State);
	} catch (Cause) {
		// LOUD (see header): the failed open never rethrows into apply - one
		// best-effort ledger line, and the store keeps its existing file
		// path unchanged.
		State.Factory.Append(
			State,
			`storage open failed: ${(Cause as Error)?.message ?? String(Cause)}`,
		);
	}
};

/** Close the open handle (the effect's disposer; a no-op when absent or
 *  already closed). */
export const Close = (): void => {
	const Handle = Current;
	Current = undefined;
	switch (true) {
		case Handle !== undefined:
			void Handle.close().catch(() => {
				/* close best-effort */
			});
			break;
	}
};
