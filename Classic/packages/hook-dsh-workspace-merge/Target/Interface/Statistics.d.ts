/**
 * @module Statistics
 *
 * The merge hook's honest counts.
 */
export default interface Statistics {
    /**
     * The number of recorded batches.
     */
    batches: number;
    /**
     * The number of applied per-file replies.
     */
    applied: number;
    /**
     * The number of conflict replies.
     */
    conflicts: number;
    /**
     * The number of rejected replies.
     */
    rejected: number;
    /**
     * The number of recovery-required replies.
     */
    recovery: number;
    /**
     * The hook's monotonic sequence counter.
     */
    sequence: number;
}
