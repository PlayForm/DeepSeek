export default interface WatchEntry {
    /** The display path as the event carried it. */
    path: string;
    /** The last observed version token (verbatim from the event). */
    version: string;
    /** The check-set identifiers the classification produced. */
    sets: string[];
    /** The clock stamp of the last observed event for the path. */
    lastEventAt: number;
    /** The clock stamp of the last sweep of the entry (undefined until the
     *  first sweep). */
    lastSweepAt: number | undefined;
    /** The clock deadline after which the entry becomes sweepable
     *  (lastEventAt + debounceMs on watch, lastSweepAt + sweepIntervalMs
     *  after a sweep). */
    nextSweepAt: number;
    /** How many times this entry has been swept. */
    sweeps: number;
    /** How many distinct versions have been observed for the path. */
    versions: number;
}
