/**
 * @module Outcome
 *
 * The per-index call result, per the brief's section 4.3 IndexOutcome.
 *
 * @remarks
 *
 * `path` is the resolved display path; a skipped or failed outcome carries
 * the reason in `reason` (the same string the ledger line carries).
 */
export default interface Outcome {
	/**
	 * The resolved display path.
	 */
	path: string;

	/**
	 * The per-file outcome.
	 */
	status: "indexed" | "skipped" | "failed";

	/**
	 * The node count the record carries.
	 */
	nodes: number;

	/**
	 * The edge count the record carries.
	 */
	edges: number;

	/**
	 * The file version token, for an indexed outcome.
	 */
	version?: string;

	/**
	 * The skip or failure reason, matching the ledger line.
	 */
	reason?: string;
}
