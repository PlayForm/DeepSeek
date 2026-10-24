// IndexSummary - the counts one `indexWorkspace` call returns (the tool's
// canonical value, and the service's own answer): the per-file outcome
// tallies of THIS run plus the file records the graph holds after it. The
// distinction matters: `indexed` counts what this call touched, `files`
// counts the graph - a second idempotent run re-indexes the same files, so
// `indexed` stays the same while `files` does not grow.
export default interface IndexSummary {
	/** The files whose per-file outcome was `indexed` in this run. */
	indexed: number;
	/** The files whose per-file outcome was `skipped` in this run. */
	skipped: number;
	/** The files whose per-file outcome was `failed` in this run. */
	failed: number;
	/** The file records the graph holds after this run (State.Records.size). */
	files: number;
}
