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
