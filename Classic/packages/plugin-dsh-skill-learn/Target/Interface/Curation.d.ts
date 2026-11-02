export interface Curation {
    /** Records examined this pass. */
    checked: number;
    /** Records that had no clock yet and were anchored to now, without a transition. */
    seeded: number;
    /** Records moved from `active` to `stale`. */
    markedStale: number;
    /** Skills moved into the archive. */
    archived: number;
    /** Zero-use skills pulled back from `stale` inside their grace floor. */
    reactivated: number;
    /** Whether the pass computed the transitions without applying them. */
    dryRun: boolean;
}
