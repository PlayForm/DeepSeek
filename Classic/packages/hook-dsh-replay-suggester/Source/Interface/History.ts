// History - the declared shape of the hook's own history store (the
// self-contained PoC rule: no import from sibling packages). The store is
// the seed of the search-suggester's journal (SEARCH-SUGGESTER-PLUGIN.md
// §9.3: "the search consumer's journal is the seed for it: the intent, the
// candidates, the outcome") plus the offline learner's output. The schema
// is THIS package's contract; the end-phase adapter maps the journal's
// entries into it.
//
// PRIVACY POSTURE (the plan §5.4): repo-relative paths only, no absolute
// home paths, no file contents, no user text, no prompts, no model output.
// A record says what was touched and how it was verified - nothing about
// what the files said.
export interface ReplayRecord {
	/** The intent label the record was mined under (e.g. "Version", "Test"). */
	intent: string;
	/** The probe literal that matched (a grep pattern, a path fragment, a command fragment). */
	probe: string;
	/** The files touched, repo-relative, in touch order. */
	files: string[];
	/** The verification command used last time (e.g. "pnpm run build:classic"). */
	verify: string;
	/** When the record was captured (epoch seconds). */
	at: number;
}

export default interface HistoryStore {
	/** The store schema version. */
	schema: number;
	/** The records, most recent first. */
	records: ReplayRecord[];
}
