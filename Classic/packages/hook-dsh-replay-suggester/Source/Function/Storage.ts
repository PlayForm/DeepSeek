// Storage - the storage-domain open and recovery (Function/Storage), the
// PRIMARY tier of the recall store (pattern P4 of Temporary/Harness-Wave/
// Plan.md section 6; the shipped sequence copied from hook-dsh-workspace-
// observe/Source/Function/Storage.ts:51-103). THE DOMAIN: `replay_history`,
// version 1, per-record layout, backup-and-skip invalid records, and NO
// `compatibleVersions` - the library rejects an entry that is not strictly
// BELOW the declared version, so `[1]` against version 1 throws at load (the
// family's learned rule). TWO tables:
//   * `history` - one record per entry: key `String(seq)`, value the Entry;
//   * `meta`    - ONE record `__savedAt`: the snapshot timestamp.
//
// THE RECOVERY FALLBACK (one release): when the domain table is EMPTY on
// open (a fresh domain after the migration), the old JSON record file
// (config `recordPath`) seeds the store once - Recover runs the shared
// Function/Restore, so the byte-exact `store recovered <n> entries (file)`
// line, the newest-N bound and the malformed-row skip are identical on both
// tiers - and the surviving entries are then put into the domain table (the
// one-time migration). The file itself is never deleted here, so a
// deployment that never opens the facility keeps working byte-for-byte.
//
// THE WRITE MIRROR: the open handle's `history` table is shadowed with an
// own-property wrapper (the ccr precedent's ShadowPut shape), so every
// future domain write also refreshes the JSON fallback file - the fallback
// stays fresh for one release. The wrapper passes through untouched once
// the handle is closed (State.Handle is cleared by the effect's disposer,
// Function/Storage's Close).
//
// The recovery lands in the SAME Function/Restore the JSON fallback uses, so
// the malformed-row skip and the sequence restart are identical on both tiers.
//
// Best-effort and detached (the family's P5-style posture): the open runs on
// the store chain from Apply, and every failure is contained here. A PRESENT
// facility whose open fails is LOUD: one best-effort ledger line
// `store open failed: <reason>`, then the JSON fallback recovers (the
// documented degraded store) - never rethrown.
//
// The dynamic imports keep the optional storage packages off the module-load
// path (a module-level import of an unresolvable package would crash the
// whole bundle load - the factory's live-verified pitfall).
import type Handle from "@Interface/Handle.js";
import type { Table } from "@Interface/Handle.js";
import type State from "@Interface/State.js";

import Recover from "./Recover.js";
import Restore from "./Restore.js";
import { Save } from "./Snapshot.js";

/** The JSON fallback's fresh write (the mirror: the fallback file stays
 *  current for one release while the domain is the primary tier). The save
 *  is best-effort (Snapshot.Save never throws) and never on the caller's
 *  await path - the store must never break a judged call. */
const Mirror = (State: State): void => {
	try {
		void Save(State.RecordPath, State.History, Date.now()).catch(() => {
			/* mirror writes best-effort */
		});
	} catch {
		/* mirror writes best-effort */
	}
};

/** Shadow the open handle's `history` table with an own-property wrapper:
 *  the original KV write runs first, then the JSON mirror. The wrapper
 *  becomes a pass-through once the handle is closed (State.Handle is
 *  cleared, so Persist stops reaching the table at all). */
const Shadow = (State: State, Handle: Handle): void => {
	const Resolve = Handle.table.bind(Handle);
	Handle.table = (Name: string): Table => {
		const Target = Resolve(Name);
		switch (true) {
			case Name !== "history":
				return Target;
		}
		const Wrapped = Target as Table & { __mirrored?: boolean };
		switch (true) {
			case Wrapped.__mirrored === true:
				return Target;
		}
		Wrapped.__mirrored = true;
		const OriginalPut = Target.put.bind(Target);
		const OriginalDelete = Target.delete.bind(Target);
		Target.put = (Key: string, Value: unknown): Promise<void> =>
			OriginalPut(Key, Value).then(() => {
				Mirror(State);
			});
		Target.delete = (Key: string): Promise<boolean> =>
			OriginalDelete(Key).then((Existed) => {
				Mirror(State);
				return Existed;
			});
		return Target;
	};
};

export default async (
	/** The plugin state (the mirror, the handle, the ledger). */
	State: State,
	/** The probed storage facility (ctx.storage.domain or ctx.storageDomain). */
	Facility: unknown,
): Promise<void> => {
	try {
		const [Domain, Zod] = await Promise.all([
			import("@deepseek-ai/dsh-storage-domain"),
			import("zod"),
		]);
		const Entry = Zod.object({
			seq: Zod.number(),
			path: Zod.string(),
			intent: Zod.string(),
			outcome: Zod.string(),
			at: Zod.number(),
			probe: Zod.string(),
		});
		const Handle = await (
			Facility as {
				open(Specification: object): Promise<Handle>;
			}
		).open(
			Domain.defineDomain({
				name: "replay_history",
				version: 1,
				layout: "per-record",
				invalidRecords: "backup-and-skip",
				tables: {
					history: Domain.domainTable(
						Entry as unknown as Parameters<typeof Domain.domainTable>[0],
					),
					meta: Domain.domainTable(
						Zod.number() as unknown as Parameters<typeof Domain.domainTable>[0],
					),
				},
			}),
		);
		// The write mirror for the rest of the release (installed before the
		// recovery, so the one-time seed also refreshes the fallback file).
		Shadow(State, Handle);
		State.Handle = Handle;
		const History_ = Handle.table("history");
		switch (true) {
			case History_.size > 0:
				// Recovery: the domain's own records (the malformed-row skip
				// and the sequence restart are Restore's).
				Restore(
					State,
					[...History_.entries()].map(([, Value]) => Value),
					"replay_history",
				);
				break;
			default: {
				// The recovery fallback (one release): the domain table is
				// EMPTY, so the old JSON record file seeds the store once -
				// and its surviving entries are put into the domain table
				// (the one-time migration). The file itself is never deleted.
				Recover(State);
				for (const Entry_ of State.History) {
					await History_.put(String(Entry_.seq), Entry_);
				}
				switch (true) {
					case State.History.length > 0:
						await Handle.table("meta").put("__savedAt", Date.now());
						break;
				}
			}
		}
	} catch (Cause) {
		// LOUD (see header): one best-effort ledger line, then the JSON
		// fallback recovers - never rethrown.
		State.Factory.Append(
			State,
			`store open failed: ${(Cause as Error)?.message ?? String(Cause)}`,
		);
		State.Handle = undefined;
		Recover(State);
	}
};

/** Close the open handle (the effect's disposer; a no-op when absent or
 *  already closed - idempotent by the cleared State.Handle). */
export const Close = (State: State): void => {
	const Handle = State.Handle;
	State.Handle = undefined;
	switch (true) {
		case Handle !== undefined:
			void Handle.close().catch(() => {
				/* close best-effort */
			});
			break;
	}
};
