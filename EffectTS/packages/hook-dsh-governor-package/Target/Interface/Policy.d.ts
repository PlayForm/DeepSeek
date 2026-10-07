export default interface Policy {
    /** Dependency names ncu must never bump (one -x/-a argument, comma-joined). */
    reject?: string[];
    /** Dependency names that gate every other update (ncu -a). */
    allow?: string[];
    /** Dependency groups to update: prod/dev/peer/optional/bundle. */
    depGroups?: string[];
    /** Concurrent registry lookups ncu may run. */
    concurrency?: number;
    /** Target selection: a default plus per-filter overrides. */
    targets?: {
        default?: string;
        overrides?: Array<{
            filter: string;
            target: string;
        }>;
    };
    /** Shell command run after the bumps; a non-zero exit fails the stage. */
    verifyCommand?: string | null;
}
