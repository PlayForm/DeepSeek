/**
 * @module Outcome
 *
 * The per-index call result (the brief's section 4.3 IndexOutcome).
 *
 * @remarks
 * `path` is the resolved display path; a skipped or failed outcome carries the reason in
 * `reason` (the same string the ledger line carries).
 */
export default interface Outcome {
	/** The resolved display path of the file. */
	path: string;

	/** The per-file status: indexed, skipped or failed. */
	status: "indexed" | "skipped" | "failed";

	/** The number of nodes the stored record holds. */
	nodes: number;

	/** The number of edges the stored record holds. */
	edges: number;

	/** The file version token at index time (indexed outcomes only). */
	version?: string;

	/** The skip or failure reason (skipped and failed outcomes only). */
	reason?: string;
}
