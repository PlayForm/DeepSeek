/**
 * @module Usage
 *
 * The usage store: one JSON object keyed by skill name, never inside a `SKILL.md`, and
 * the curator's whole input.
 *
 * @remarks
 * THE STORE IS A SIDECAR, never the corpus: the corpus is directories of markdown a
 * person reads and edits, so bookkeeping lives beside it where a bad write cannot
 * corrupt a skill (tools/skill_usage.py:1-2, :51-52).
 *
 * ONE TOP-LEVEL KEY IS NOT A RECORD: the curator's clock is persisted under `curatedAt`
 * beside the skill keys, because the clock has to survive a restart and this store is
 * the one thing the plugin already writes atomically (SKILL-LEARN-PLUGIN.md:146). A
 * skill name can never collide with it, since the corpus grammar is
 * `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`, so the reader recognises the key by name and never
 * coerces it into a record - and a second store would be a second failure mode for one
 * number.
 *
 * A CORRUPT STORE IS QUARANTINED, NOT OVERWRITTEN. Hermes reads a corrupt or unreadable
 * store as `{}` and the next successful bump rewrites the whole file with a map holding
 * one record, which silently loses every other record (tools/skill_usage.py:369-377,
 * :406, Hermes-Curator-Pass.md:406). That behaviour is not copied: a read failure moves
 * the file to `<storagePath>.corrupt-<YYYYMMDDHHMMSS>` and starts from an empty store,
 * one ledger line names the error and the quarantine path, and the quarantined bytes
 * stay on disk for inspection (SKILL-LEARN-PLUGIN.md:647-657). When the move itself
 * fails, the store REFUSES to save, so the next write cannot destroy the only copy.
 *
 * TWO FIELDS ARE DERIVED AND NEVER PERSISTED: `lastActivityAt` is the maximum of the
 * two activity stamps with `createdAt` deliberately excluded, so a skill that was never
 * active stays distinguishable from one that was (tools/skill_usage.py:123-127), and it
 * is recomputed on every mutation rather than stored, so a read never sees a stale
 * value (Interface/Record.ts:42-43).
 *
 * WRITES ARE ATOMIC AND ORDERED: one promise chain, so a load always precedes a write
 * and two saves cannot interleave, and each save lands through a temporary file and a
 * rename (tools/skill_usage.py:384, SKILL-LEARN-PLUGIN.md:657).
 */
import { randomBytes } from "node:crypto";
import FileSystem from "node:fs/promises";
import Path from "node:path";

import type UsageRecord from "@Interface/Record.js";

/** What a load found, and why it found nothing. */
export interface LoadResult {
	/** How many records the store held. */
	readonly loaded: number;
	/** How many entries were dropped because they were not records. */
	readonly dropped: number;
	/** Why the store could not be read, when it could not. */
	readonly error?: string;
	/** Where the unreadable store was moved, when the quarantine succeeded. */
	readonly quarantined?: string;
}

/** What a save did. */
export interface SaveResult {
	readonly ok: boolean;
	/** Why the save failed, when it did. */
	readonly error?: string;
}

/** One store entry: the name is the key, so the record does not carry it. */
export interface Stored {
	/** The skill name, which is the store's key. */
	readonly name: string;
	/** The record itself. */
	readonly record: UsageRecord;
}

/** What one use did, so the report can say whether the skill was reused after a patch. */
export interface Reused {
	readonly record: UsageRecord;
	/** Whether this was not the first use. */
	readonly reused: boolean;
	/** Whether the skill was used again after a patch landed since the last reuse. */
	readonly reuseAfterPatch: boolean;
}

/**
 * The one top-level key that is not a record: the curator's clock, in epoch
 * milliseconds. No skill can own the key - the corpus grammar is
 * `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` and this spelling has an upper-case letter - so
 * the reader recognises it and never coerces it into a record.
 */
const ClockKey = "curatedAt";

/** A new record, with every field at its zero value (tools/skill_usage.py:348-353). */
const Fresh = (Now: Date, CreatedBy: UsageRecord["createdBy"]): UsageRecord => ({
	createdBy: CreatedBy,
	useCount: 0,
	patchCount: 0,
	patchGeneration: 0,
	lastReusedPatchGeneration: 0,
	lastUsedAt: null,
	lastPatchedAt: null,
	createdAt: Now.toISOString(),
	firstSeenAt: null,
	state: "active",
	pinned: false,
	archivedAt: null,
	lastActivityAt: null,
});

/** The maximum of the two activity stamps; every stamp is ISO-8601 UTC, so the order is lexical. */
const Activity = (Record_: UsageRecord): string | null => {
	const Stamps = [Record_.lastUsedAt, Record_.lastPatchedAt].filter(
		(Stamp): Stamp is string => Stamp !== null,
	);
	switch (true) {
		case Stamps.length === 0:
			return null;
		default:
			return Stamps.reduce((Left, Right) => (Left > Right ? Left : Right));
	}
};

/** One stored entry, coerced field by field; undefined when it is not a record at all. */
const Coerce = (Raw: unknown): UsageRecord | undefined => {
	switch (true) {
		case typeof Raw !== "object" || Raw === null || Array.isArray(Raw):
			return undefined;
		default:
			break;
	}
	const Value = Raw as Record<string, unknown>;
	const Stamp = (Key: string): string | null => {
		const Given = Value[Key];
		return typeof Given === "string" ? Given : null;
	};
	const Count = (Key: string): number => {
		const Given = Value[Key];
		return typeof Given === "number" && Number.isFinite(Given) && Given > 0
			? Math.floor(Given)
			: 0;
	};
	// A record with no creation stamp cannot be aged, so it is dropped rather than
	// anchored to the epoch and archived on the next pass.
	const Created = Stamp("createdAt");
	if (Created === null) {
		return undefined;
	}
	const State = Value["state"];
	const CreatedBy = Value["createdBy"];
	return {
		createdBy: CreatedBy === "agent" || CreatedBy === "learn" ? CreatedBy : null,
		useCount: Count("useCount"),
		patchCount: Count("patchCount"),
		patchGeneration: Count("patchGeneration"),
		lastReusedPatchGeneration: Count("lastReusedPatchGeneration"),
		lastUsedAt: Stamp("lastUsedAt"),
		lastPatchedAt: Stamp("lastPatchedAt"),
		createdAt: Created,
		firstSeenAt: Stamp("firstSeenAt"),
		state: State === "stale" || State === "archived" ? State : "active",
		pinned: Value["pinned"] === true,
		archivedAt: Stamp("archivedAt"),
		lastActivityAt: null,
	};
};

export default class Usage {
	/** The store path, already expanded by the caller. */
	private Path: string;

	/** The live records, keyed by skill name. */
	private Rows: Map<string, UsageRecord> = new Map();

	/**
	 * The curator's clock: the epoch milliseconds of the last pass, or null when
	 * the store holds none. It is a field of the STORE and not of the service,
	 * because a clock in the service resets on every restart and a machine that
	 * restarts often would then never curate - every pass would be the seeding
	 * pass that transitions nothing (SKILL-LEARN-PLUGIN.md:146).
	 */
	private Clock: number | null = null;

	/** The one load, so a save always follows a load and a second call is free. */
	private Ready: Promise<LoadResult> | undefined;

	/** The write chain, so two saves cannot interleave. */
	private Chain: Promise<void> = Promise.resolve();

	/** Whether the store is unreadable AND could not be quarantined. */
	private Poisoned = false;

	constructor(Path_: string) {
		this.Path = Path_;
	}

	/** Load the store once; never throws. */
	Load(): Promise<LoadResult> {
		const Ready = this.Ready ?? this.Read();
		this.Ready = Ready;
		return Ready;
	}

	/** Read the file, quarantining it when it cannot be trusted. */
	private async Read(): Promise<LoadResult> {
		// The catch returns on every arm, so the empty initial value is never read.
		let Text = "";
		try {
			Text = await FileSystem.readFile(this.Path, "utf8");
		} catch (Cause) {
			const Code = (Cause as { readonly code?: unknown } | undefined)?.code;
			switch (true) {
				case Code === "ENOENT":
					return { loaded: 0, dropped: 0 };
				default:
					return this.Quarantine(Cause);
			}
		}
		let Raw: unknown;
		try {
			Raw = JSON.parse(Text);
		} catch (Cause) {
			return this.Quarantine(Cause);
		}
		switch (true) {
			case typeof Raw !== "object" || Raw === null || Array.isArray(Raw):
				return this.Quarantine(new Error("the store root is not an object"));
			default:
				break;
		}
		let Loaded = 0;
		let Dropped = 0;
		for (const [Name, Entry] of Object.entries(Raw as Record<string, unknown>)) {
			// The clock is the store's one reserved key, so it is read as the clock and
			// never counted as a dropped record. An unreadable stamp is null, which is
			// the honest "never curated" answer, rather than a number nobody can trust.
			if (Name === ClockKey) {
				this.Clock =
					typeof Entry === "number" && Number.isFinite(Entry) && Entry > 0
						? Math.floor(Entry)
						: null;
				continue;
			}
			const Record_ = Coerce(Entry);
			if (Record_ === undefined) {
				Dropped += 1;
				continue;
			}
			this.Rows.set(Name, { ...Record_, lastActivityAt: Activity(Record_) });
			Loaded += 1;
		}
		return { loaded: Loaded, dropped: Dropped };
	}

	/** Move an unreadable store aside and start empty; a failed move poisons the store. */
	private async Quarantine(Cause: unknown): Promise<LoadResult> {
		const Reason = Cause instanceof Error ? Cause.message : String(Cause);
		const Stamp = new Date()
			.toISOString()
			.replace(/[-:]/g, "")
			.replace(/\.\d{3}Z$/, "");
		const Target = `${this.Path}.corrupt-${Stamp}`;
		try {
			await FileSystem.rename(this.Path, Target);
			this.Rows.clear();
			// A quarantined store starts EMPTY, clock included: the bytes that held the
			// clock are the bytes nobody could read, so keeping the number would be
			// trusting the file the quarantine just refused.
			this.Clock = null;
			return { loaded: 0, dropped: 0, error: Reason, quarantined: Target };
		} catch (Failure) {
			this.Poisoned = true;
			return {
				loaded: 0,
				dropped: 0,
				error: `${Reason} (quarantine failed: ${Failure instanceof Error ? Failure.message : String(Failure)})`,
			};
		}
	}

	/** One record, or undefined when the store holds none. */
	Get(Name: string): UsageRecord | undefined {
		return this.Rows.get(Name);
	}

	/** Every record, sorted by name, which is the report's stable order. */
	All(): readonly Stored[] {
		return [...this.Rows.entries()]
			.sort(([Left], [Right]) => Left.localeCompare(Right))
			.map(([name, record]) => ({ name, record }));
	}

	/**
	 * The curator's clock: the persisted epoch milliseconds of the last pass, or
	 * null when the store holds none. It is read from the store rather than from
	 * the service so a restart keeps the interval; null is the first-run case,
	 * which the caller anchors by running the pass (SKILL-LEARN-PLUGIN.md:146).
	 */
	CuratedAt(): number | null {
		return this.Clock;
	}

	/**
	 * Record one curation pass. The value is written by `Save` beside the records,
	 * under the one reserved top-level key, so the clock and the transitions it
	 * justifies land in the same atomic write.
	 */
	Curated(Now: Date): void {
		const Stamp = Now.getTime();
		switch (true) {
			case Number.isFinite(Stamp):
				this.Clock = Stamp;
				break;
			default:
				// An invalid Date has no epoch to persist, and a NaN would be serialized
				// as null and read back as "never curated", which is the honest answer.
				break;
		}
	}

	/** Store one record and recompute the derived activity stamp. */
	private Settle(Name: string, Next: UsageRecord): UsageRecord {
		const Settled: UsageRecord = { ...Next, lastActivityAt: Activity(Next) };
		this.Rows.set(Name, Settled);
		return Settled;
	}

	/**
	 * One observed load through the `skill` tool. A use is not a plain increment:
	 * the patch-generation watermark moves only when the skill is reused after a
	 * patch landed (tools/skill_usage.py:499-508).
	 */
	Use(Name: string, Now: Date): Reused {
		const Existing = this.Rows.get(Name) ?? Fresh(Now, null);
		const Generation = Existing.patchGeneration;
		const Again = Existing.useCount > 0;
		const Last = Math.min(Existing.lastReusedPatchGeneration, Generation);
		const ReuseAfterPatch = Again && Generation > Last;
		return {
			record: this.Settle(Name, {
				...Existing,
				useCount: Existing.useCount + 1,
				lastUsedAt: Now.toISOString(),
				patchGeneration: Generation,
				lastReusedPatchGeneration: ReuseAfterPatch ? Generation : Last,
			}),
			reused: Again,
			reuseAfterPatch: ReuseAfterPatch,
		};
	}

	/** One successful `patch` or `support` write: the count and the generation move together. */
	Patched(Name: string, Now: Date): UsageRecord {
		const Existing = this.Rows.get(Name) ?? Fresh(Now, null);
		return this.Settle(Name, {
			...Existing,
			patchCount: Existing.patchCount + 1,
			patchGeneration: Existing.patchGeneration + 1,
			lastPatchedAt: Now.toISOString(),
		});
	}

	/**
	 * One created skill. The record is rewritten from the zero value because a
	 * create is a new logical skill: any surviving record belonged to a skill of the
	 * same name that no longer exists (tools/skill_usage.py:530-533). `createdBy:
	 * "agent"` is the curation opt-in, not an authorship claim
	 * (tools/skill_usage.py:290-297).
	 */
	Created(Name: string, Now: Date): UsageRecord {
		return this.Settle(Name, Fresh(Now, "agent"));
	}

	/** Anchor a record's inactivity clock on first sight, without transitioning it (R3). */
	Seeded(Name: string, Now: Date): UsageRecord {
		const Existing = this.Rows.get(Name) ?? Fresh(Now, null);
		return this.Settle(Name, { ...Existing, firstSeenAt: Now.toISOString() });
	}

	/** Move one record's lifecycle state; `archivedAt` is set on archive and cleared otherwise. */
	State(Name: string, Next: UsageRecord["state"], Now: Date): UsageRecord | undefined {
		const Existing = this.Rows.get(Name);
		if (Existing === undefined) {
			return undefined;
		}
		return this.Settle(Name, {
			...Existing,
			state: Next,
			archivedAt: Next === "archived" ? (Existing.archivedAt ?? Now.toISOString()) : null,
		});
	}

	/** Exempt one record from every transition, or lift the exemption. */
	Pinned(Name: string, Pinned_: boolean): UsageRecord | undefined {
		const Existing = this.Rows.get(Name);
		if (Existing === undefined) {
			return undefined;
		}
		return this.Settle(Name, { ...Existing, pinned: Pinned_ });
	}

	/** Persist the store: one chain, one temporary file, one rename. Never throws. */
	async Save(): Promise<SaveResult> {
		await this.Load();
		switch (true) {
			case this.Poisoned:
				return {
					ok: false,
					error: "the store is quarantined and could not be moved aside",
				};
			default:
				break;
		}
		// The clock leads the file so the one key that is not a record reads as the
		// store's header, and the records follow in the stable name order the report
		// uses. Both halves are one object, so one atomic write carries both.
		const Body = `${JSON.stringify(
			{
				...(this.Clock === null ? {} : { [ClockKey]: this.Clock }),
				...Object.fromEntries(
					[...this.Rows.entries()].sort(([Left], [Right]) => Left.localeCompare(Right)),
				),
			},
			null,
			"\t",
		)}\n`;
		const Run = this.Chain.then(async (): Promise<void> => {
			await FileSystem.mkdir(Path.dirname(this.Path), { recursive: true });
			const Temporary = `${this.Path}.${randomBytes(4).toString("hex")}.tmp`;
			await FileSystem.writeFile(Temporary, Body, "utf8");
			await FileSystem.rename(Temporary, this.Path);
		});
		// The chain keeps running after a failure, so one bad save does not block the
		// next one.
		this.Chain = Run.catch(() => undefined);
		try {
			await Run;
			return { ok: true };
		} catch (Cause) {
			return { ok: false, error: Cause instanceof Error ? Cause.message : String(Cause) };
		}
	}
}
