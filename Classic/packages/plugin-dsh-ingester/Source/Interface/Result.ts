// Result - the honest apply report (plan section 2, BatchResult). Every
// target gets its own outcome; the applied targets are reported even when a
// later one fails - no invisible intermediate state.
export default interface Result {
	/** The proposal id. */
	proposal: string;
	/** Per-target outcomes, in the proposal's order. */
	perTarget: {
		path: string;
		outcome: "applied" | "conflict" | "skipped" | "recovery-required";
		version?: string;
	}[];
	/** Counts. */
	applied: number;
	conflicts: number;
	recovery: number;
}
