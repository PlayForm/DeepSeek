/**
 * @module Curation
 *
 * The counters one curator pass reports.
 *
 * @remarks
 * The fields are transitions rather than skills, because the ledger line and the report
 * carry counts and the per-skill detail belongs to the store. They are mutable on
 * purpose: the pass increments them while it walks the candidate set, and nothing
 * outside the pass may write them, which is why the pass hands back this record and
 * never the store it read.
 */
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
