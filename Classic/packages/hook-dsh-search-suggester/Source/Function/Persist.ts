// Persist - the learned knowledge file (plan section 5): load, update, save.
// The file lives under ~/.dsh/search-suggester/ (never the repo), is written
// atomically (temp + rename) with mode 0600, and keeps the journal bounded
// (the last 2000 entries, a ring). A load failure or a corrupt file degrades
// to empty knowledge - the static pack alone is enough to emit (the cold
// start of plan section 6.4) - and every failure logs through the caller,
// never throws into the hot path.
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { Expand } from "@playform/lib-dsh-core";

import type { Dismissal, Knowledge, KnowledgeRow } from "../Interface/Execution.js";

/** The journal ring's capacity (plan section 5.3). */
const JournalLimit = 2000;

/** The empty knowledge (the cold start). */
export const Empty = (): Knowledge => ({
	schema: 1,
	intents: {},
	journal: [],
	dismissals: [],
	seed: false,
	stats: { emitted: 0, followed: 0, ignored: 0, dismissed: 0 },
});

/** The stats counters, defaulted field by field (an older file may lack one). */
const Stats = (Value: unknown): Knowledge["stats"] => {
	const Stats_ = (Value ?? {}) as Partial<Knowledge["stats"]>;
	return {
		emitted: Number(Stats_.emitted ?? 0),
		followed: Number(Stats_.followed ?? 0),
		ignored: Number(Stats_.ignored ?? 0),
		dismissed: Number(Stats_.dismissed ?? 0),
	};
};

/** One persisted dismissal, accepted only in its declared shape. */
const ReadDismissal = (Value: unknown): Dismissal | undefined => {
	const Entry = Value as { intent?: unknown; path?: unknown; until?: unknown } | undefined;
	if (typeof Entry?.intent !== "string" || Entry.intent.length === 0) {
		return undefined;
	}
	if (typeof Entry.until !== "number" || !Number.isFinite(Entry.until)) {
		return undefined;
	}
	return typeof Entry.path === "string" && Entry.path.length > 0
		? { intent: Entry.intent, path: Entry.path, until: Entry.until }
		: { intent: Entry.intent, until: Entry.until };
};

/**
 * Load the knowledge file; a missing or corrupt file yields empty knowledge
 * (the corruption fallback of plan section 5.3). The optional fields the
 * PoC files predate (`dismissals`, the seed markers) are normalized here, so
 * an older file loads without a migration.
 * @param File - the knowledge file path.
 */
export default (File: string): Knowledge => {
	try {
		const Parsed: unknown = JSON.parse(fs.readFileSync(File, "utf8"));
		if (
			Parsed &&
			typeof Parsed === "object" &&
			(Parsed as Knowledge).schema === 1 &&
			typeof (Parsed as Knowledge).intents === "object"
		) {
			const Knowledge = Parsed as Knowledge;
			Knowledge.journal = Array.isArray(Knowledge.journal) ? Knowledge.journal : [];
			Knowledge.dismissals = Array.isArray(Knowledge.dismissals)
				? Knowledge.dismissals.flatMap((Entry) => {
						const Read = ReadDismissal(Entry);
						return Read === undefined ? [] : [Read];
					})
				: [];
			Knowledge.stats = Stats(Knowledge.stats);
			return Knowledge;
		}
	} catch {
		/* missing or corrupt: the cold start */
	}
	return Empty();
};

/**
 * Look up one candidate's history row.
 * @param Knowledge - the loaded knowledge.
 */
export const Row = (Knowledge: Knowledge, Intent: string, Path: string): KnowledgeRow | undefined =>
	Knowledge.intents[Intent]?.[Path];

/**
 * Record one emitted note: the candidates get their counts, the stats move,
 * a journal entry is appended (bounded).
 *
 * A SEEDED row is a PRIOR, not an observation: the emit leaves its count
 * alone (the seed's warm Laplace rate is stable across emits, so a note's
 * candidate set does not re-order against itself and the dedupe still sees
 * the same set). The first follow converts the row into an observed row
 * (Followed clears the marker) and the ordinary counting resumes.
 */
export const Emitted = (
	Knowledge: Knowledge,
	Intent: string,
	Call: string,
	Kappa: number,
	Paths: string[],
	At: number,
): void => {
	const Bucket = (Knowledge.intents[Intent] ??= {});
	for (const Path of Paths) {
		const RowEntry = (Bucket[Path] ??= { count: 0, followed: 0, lastSeen: At });
		if (RowEntry.seed !== true) {
			RowEntry.count += 1;
		}
		RowEntry.lastSeen = At;
	}
	Knowledge.stats.emitted += 1;
	Knowledge.journal.push({
		id: `sug-${randomUUID().slice(0, 8)}`,
		intent: Intent,
		call: Call,
		at: At,
		kappa: Kappa,
		candidates: Paths,
		outcome: "ignored",
	});
	if (Knowledge.journal.length > JournalLimit) {
		Knowledge.journal.splice(0, Knowledge.journal.length - JournalLimit);
	}
};

/**
 * Record that the model followed a candidate (a candidate path appears in a
 * later call): count/followed move, the journal entry closes as "followed".
 * A seeded row becomes an observed row here (the marker is cleared).
 */
export const Followed = (Knowledge: Knowledge, Intent: string, Path: string, At: number): void => {
	const Bucket = (Knowledge.intents[Intent] ??= {});
	const RowEntry = (Bucket[Path] ??= { count: 0, followed: 0, lastSeen: At });
	RowEntry.count += 1;
	RowEntry.followed += 1;
	RowEntry.lastSeen = At;
	delete RowEntry.seed;
	Knowledge.stats.followed += 1;
	const Open = [...Knowledge.journal]
		.reverse()
		.find((Entry) => Entry.intent === Intent && Entry.outcome === "ignored");
	if (Open) {
		Open.outcome = "followed";
		Open.followedBy = Path;
	}
};

/**
 * Record that a note's window closed untouched: the near-miss/ignored
 * penalty of plan section 6.2 (the history drop is applied by Score via the
 * Laplace inputs; here only the stats and the journal move).
 */
export const Ignored = (Knowledge: Knowledge, Intent: string): void => {
	Knowledge.stats.ignored += 1;
	const Open = [...Knowledge.journal]
		.reverse()
		.find((Entry) => Entry.intent === Intent && Entry.outcome === "ignored");
	if (Open) {
		Open.outcome = "ignored";
	}
};

/**
 * Drop the expired dismissals in place: at or after `until` the entry is
 * forgotten (the documented TTL semantics - `until <= At` is expired).
 */
const Prune = (Knowledge: Knowledge, At: number): void => {
	if (!Array.isArray(Knowledge.dismissals)) {
		Knowledge.dismissals = [];
		return;
	}
	Knowledge.dismissals = Knowledge.dismissals.filter((Entry) => Entry.until > At);
};

/**
 * Record one dismissal (the `suggestion_dismiss` tool's write): replace the
 * entry for the same intent and path, or append it, then move the stats
 * counter and prune the expired rows. The caller saves the file.
 */
export const Dismiss = (
	Knowledge: Knowledge,
	Intent: string,
	Path: string | undefined,
	Until: number,
	At: number,
): Dismissal => {
	Knowledge.dismissals = Array.isArray(Knowledge.dismissals) ? Knowledge.dismissals : [];
	const Existing = Knowledge.dismissals.find(
		(Entry) => Entry.intent === Intent && Entry.path === Path,
	);
	const Record: Dismissal = Existing ?? {
		intent: Intent,
		...(Path === undefined ? {} : { path: Path }),
		until: Until,
	};
	Record.until = Until;
	if (Existing === undefined) {
		Knowledge.dismissals.push(Record);
	}
	Knowledge.stats.dismissed += 1;
	Prune(Knowledge, At);
	return Record;
};

/**
 * Whether a dismissal covers the intent (`Path` undefined asks for the
 * family) or the candidate path (a family dismissal covers every path).
 * Expired rows are pruned on the read, so the TTL needs no timer.
 */
export const Dismissed = (
	Knowledge: Knowledge,
	Intent: string,
	Path: string | undefined,
	At: number,
): boolean => {
	Prune(Knowledge, At);
	return Knowledge.dismissals.some(
		(Entry) =>
			Entry.intent === Intent &&
			(Path === undefined
				? Entry.path === undefined
				: Entry.path === undefined || Entry.path === Path),
	);
};

/**
 * Save the knowledge file atomically (temp + rename, mode 0600); a failure
 * is silent here - the caller decides whether to log.
 * @param File - the knowledge file path.
 */
export const Save = (Knowledge: Knowledge, File: string): void => {
	try {
		// The config default is `~/.dsh/...`: expand it ONCE at the write
		// site, or the mkdir creates a literal "~" directory under the cwd.
		const Full = Expand(File);
		const Dir = path.dirname(Full);
		fs.mkdirSync(Dir, { recursive: true });
		const Temp = path.join(Dir, `.${path.basename(Full)}.tmp`);
		fs.writeFileSync(Temp, JSON.stringify(Knowledge), { mode: 0o600 });
		fs.renameSync(Temp, Full);
	} catch {
		/* the knowledge save is best-effort; the static pack still emits */
	}
};
