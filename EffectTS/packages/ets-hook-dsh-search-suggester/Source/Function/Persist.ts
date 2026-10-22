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

import type { Knowledge, KnowledgeRow } from "../Interface/Execution.js";

/** The journal ring's capacity (plan section 5.3). */
const JournalLimit = 2000;

/** The empty knowledge (the cold start). */
export const Empty = (): Knowledge => ({
	schema: 1,
	intents: {},
	journal: [],
	stats: { emitted: 0, followed: 0, ignored: 0, dismissed: 0 },
});

/**
 * Load the knowledge file; a missing or corrupt file yields empty knowledge
 * (the corruption fallback of plan section 5.3).
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
			return Parsed as Knowledge;
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
		RowEntry.count += 1;
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
 */
export const Followed = (Knowledge: Knowledge, Intent: string, Path: string, At: number): void => {
	const Bucket = (Knowledge.intents[Intent] ??= {});
	const RowEntry = (Bucket[Path] ??= { count: 0, followed: 0, lastSeen: At });
	RowEntry.count += 1;
	RowEntry.followed += 1;
	RowEntry.lastSeen = At;
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
 * Save the knowledge file atomically (temp + rename, mode 0600); a failure
 * is silent here - the caller decides whether to log.
 * @param File - the knowledge file path.
 */
export const Save = (Knowledge: Knowledge, File: string): void => {
	try {
		const Dir = path.dirname(File);
		fs.mkdirSync(Dir, { recursive: true });
		const Temp = path.join(Dir, `.${path.basename(File)}.tmp`);
		fs.writeFileSync(Temp, JSON.stringify(Knowledge), { mode: 0o600 });
		fs.renameSync(Temp, File);
	} catch {
		/* the knowledge save is best-effort; the static pack still emits */
	}
};
