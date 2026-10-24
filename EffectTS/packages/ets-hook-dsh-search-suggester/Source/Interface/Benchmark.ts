// Note - one emitted suggestion as the replay benchmark reads it: the
// intent, the candidate paths the note named (glob rows included), and the
// 1-based index of the call in the fixed sequence that produced it. The
// benchmark scorer (Function/Benchmark) groups these by intent.
export interface Note {
	/** The winning intent id (the note's family). */
	intent: string;
	/** The emitted candidate paths, in the note's order. */
	candidates: string[];
	/** The 1-based call index of the fixed sequence that emitted the note. */
	call: number;
}
