// History - the history store reader (Function/History.ts): loads the
// store ONCE at apply (a JSON read on the boot path, not the hot path - the
// plan §4.3 posture), validates it leniently, and recalls records at use
// time. A missing store is not an error: it degrades to silence with a
// ledger line (`history missing (starting empty)`), so a fresh machine
// works before the first seeding. A corrupt store degrades the same way
// (`history corrupt (starting empty)`) - never a throw into apply.
//
// The store schema is Interface/History.ts; the records arrive seeded by
// the offline learner / the search-suggester journal (the end-phase wiring
// - this package never writes the store in v1).
//
// PRIVACY POSTURE (the plan §5.4): repo-relative paths only; the recall
// compares literals only.
import * as FileSystem from "node:fs";
import * as Os from "node:os";

import type HistoryStore from "@Interface/History.js";
import type { ReplayRecord } from "@Interface/History.js";

/** Expand a `~`-prefixed path (the store lives under ~/.dsh). */
const Expand = (Path: string): string =>
	Path.startsWith("~") ? Os.homedir() + Path.slice(1) : Path;

/** Whether a parsed value is a plausible record. */
const Valid = (Value: unknown): Value is ReplayRecord => {
	if (Value === null || typeof Value !== "object") {
		return false;
	}
	const Record = Value as Partial<ReplayRecord>;
	return (
		typeof Record.intent === "string" &&
		typeof Record.probe === "string" &&
		Record.probe.length > 0 &&
		Array.isArray(Record.files) &&
		Record.files.every((File) => typeof File === "string")
	);
};

/**
 * Load the store once at apply.
 * @param Path - the configured store path (may be `~`-prefixed).
 * @param Log - the ledger line sink for the load outcome.
 * @returns the records, most recent first; empty when the store is absent
 * or corrupt (the degradation, never a throw).
 */
export default (Path: string, Log: (Line: string) => void): ReplayRecord[] => {
	try {
		const Full = Expand(Path);
		if (!FileSystem.existsSync(Full)) {
			Log("history missing (starting empty)");
			return [];
		}
		const Parsed: unknown = JSON.parse(FileSystem.readFileSync(Full, "utf8"));
		if (Parsed === null || typeof Parsed !== "object") {
			Log("history corrupt (starting empty)");
			return [];
		}
		const Store = Parsed as Partial<HistoryStore>;
		if (Store.schema !== 1 || !Array.isArray(Store.records)) {
			Log("history corrupt (starting empty)");
			return [];
		}
		const Records = Store.records.filter(Valid);
		Log(`history loaded ${Records.length} records`);
		return Records;
	} catch (Error) {
		Log(`history corrupt (starting empty) ${String(Error).slice(0, 80)}`);
		return [];
	}
};

/**
 * Recall the record whose probe matches the current probe: a record
 * matches when its probe literal occurs in the current probe (or vice
 * versa) - the semantic repetition is the record's job (it was mined with
 * the intent label); the recall is the literal check only. The LONGEST
 * matching probe wins (the most specific record).
 */
export const Recall = (Records: ReplayRecord[], Probe: string): ReplayRecord | undefined => {
	let Best: ReplayRecord | undefined;
	let BestLength = 0;
	for (const Record of Records) {
		if (Record.probe.length <= BestLength) {
			continue;
		}
		if (Probe.includes(Record.probe) || Record.probe.includes(Probe)) {
			Best = Record;
			BestLength = Record.probe.length;
		}
	}
	return Best;
};

/** The history signal's weight (the plan §3.5 "history" row, lifted to 0.6 so a recalled record crosses the gate together with the search/literal/context signals). */
export const LIFT = 0.6;
