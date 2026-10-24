// Learned - the learning bootstrap's answer (D4): the proposal that was
// written, its repo slug and the number of derived families. `undefined` from
// Function/Learn means "no proposal this call" (learning off, a pack already
// installed, a workspace without markers, or the once-per-process gate
// already spent on this root).
export default interface Learned {
	/** The repo slug (the root's basename, lowercased) - the proposal's name. */
	slug: string;
	/** The absolute proposal path under `<home>/.dsh/playform/proposals/`. */
	path: string;
	/** The number of families the derivation found. */
	families: number;
}
