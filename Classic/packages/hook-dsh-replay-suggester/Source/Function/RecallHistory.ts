// RecallHistory - the LIVE history's recall (Function/RecallHistory): the
// companions of a similar prior call. This is the reader the completion
// spec's wave 2c re-spec finally feeds - before the producer
// (Function/Record) the recall always missed.
//
// THE MATCH: the most recent prior entry that is SIMILAR to this call. Two
// calls are similar when
//   1. their probes share the tool name (the probe's first segment), AND
//   2. one probe literal occurs in the other (the seeded store's rule - the
//      repeated identical call), OR
//   3. their paths share a directory (the same area was touched before).
//
// THE EPISODE: the anchor plus the entries within `learnWindow` positions of
// it, newest first - the paths that ACCOMPANIED the similar call. That is the
// "what did the last run of this touch" answer, and it is why one entry alone
// is not the recall.
//
// THE CURRENT CALL IS NEVER ITS OWN HISTORY: the producer records the call
// BEFORE the recall runs (so the entry exists on every return path), and the
// `Before` sequence fence excludes it and anything newer.
//
// The answer is the SEEDED record shape (Interface/History) with an empty
// `verify`, so the note path, the caveat fallback and the delivery surface
// are the same for both sources.
import { dirname } from "node:path";

import type Entry from "@Interface/Entry.js";
import type { ReplayRecord } from "@Interface/History.js";

/** Whether a prior entry is similar to this call. */
const Similar = (Entry_: Entry, Probe: string, Path: string): boolean => {
	const Tool = Probe.split(" ")[0] ?? "";
	switch (true) {
		case (Entry_.probe.split(" ")[0] ?? "") !== Tool:
			return false;
		case Entry_.probe.length > 0 &&
			(Probe.includes(Entry_.probe) || Entry_.probe.includes(Probe)):
			return true;
		case Entry_.path.length === 0 || Path.length === 0:
			return false;
		default:
			return dirname(Entry_.path) === dirname(Path);
	}
};

export default (
	/** The entries, newest first (an agent's ring or the durable mirror). */
	Entries: Entry[],
	/** The current call's probe. */
	Probe: string,
	/** The current call's path ("" when the call names none). */
	Path: string,
	/** The episode radius (config `learnWindow`, volatile). */
	Window: number,
	/** The sequence fence: only entries STRICTLY older than this are prior. */
	Before: number,
): ReplayRecord | undefined => {
	const Prior = Entries.filter((Entry_) => Entry_.seq < Before);
	const Anchor = Prior.find((Entry_) => Similar(Entry_, Probe, Path));
	if (Anchor === undefined) {
		return undefined;
	}
	const Index = Prior.indexOf(Anchor);
	const Episode = [
		Anchor,
		...Prior.slice(Math.max(0, Index - Window), Index),
		...Prior.slice(Index + 1, Index + Window + 1),
	];
	const Files = [
		...new Set(Episode.map((Entry_) => Entry_.path).filter((Path_) => Path_.length > 0)),
	];
	switch (true) {
		case Files.length === 0:
			return undefined;
		default:
			return {
				intent: Anchor.intent,
				probe: Anchor.probe,
				files: Files,
				verify: "",
				at: Anchor.at,
			};
	}
};
