// Entry - one recorded judged call (Interface/Entry.ts): the store's unit.
// The completion spec's wave 2c re-spec for this package
// (Documentation/Plans/Completion-Spec/03-SUGGESTERS.md) makes the hook the
// PRODUCER of the recall history - the reader had no data before.
//
// THE SHAPE: the path the call named, the family/intent it was judged under,
// the downstream decision's outcome, when it happened, and the PROBE (the
// similarity key the recall matches on - the tool name plus the arguments
// JSON, the same text the classifier sees). `seq` is the store's monotonic
// order: it makes the episode window deterministic and the KV keys unique
// across sessions.
//
// PRIVACY POSTURE (the plan §5.4, unchanged): repo-relative paths only, no
// absolute home paths, no file contents, no user text, no model output. An
// entry says which path was touched under which intent - nothing about what
// the file said.
export default interface Entry {
	/** The store's monotonic order (the KV key, the episode's anchor). */
	seq: number;
	/** The path the call named (repo-relative when the call was). */
	path: string;
	/** The family ("replay") or the intent the call was judged under ("Repeat"). */
	intent: string;
	/** The downstream decision's outcome (the tool decision's kind). */
	outcome: string;
	/** When the call was judged (epoch milliseconds). */
	at: number;
	/** The similarity key: the tool name plus the arguments JSON. */
	probe: string;
}
