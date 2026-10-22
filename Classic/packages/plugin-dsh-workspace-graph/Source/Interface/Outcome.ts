// Outcome - the per-index call result (the brief's section 4.3 IndexOutcome).
// `path` is the resolved display path; a skipped or failed outcome carries
// the reason in `reason` (the same string the ledger line carries).
export default interface Outcome {
	path: string;
	status: "indexed" | "skipped" | "failed";
	nodes: number;
	edges: number;
	version?: string;
	reason?: string;
}
