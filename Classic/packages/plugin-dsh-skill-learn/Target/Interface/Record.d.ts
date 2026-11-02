export default interface Record {
    /** The curation opt-in policy flag; only `"agent"` opens jurisdiction. */
    readonly createdBy: null | "agent" | "learn";
    /** Observed loads through the `skill` tool. */
    useCount: number;
    /** Successful `patch` and `support` writes. */
    patchCount: number;
    /** Monotonic, incremented with `patchCount`. */
    patchGeneration: number;
    /** The generation at the last use, clamped to `patchGeneration` on read. */
    lastReusedPatchGeneration: number;
    /** The last use, ISO-8601 UTC, or null before the first. */
    lastUsedAt: string | null;
    /** The last write, ISO-8601 UTC, or null before the first. */
    lastPatchedAt: string | null;
    /** The creation stamp, and the anchor fallback when no activity stamp exists. */
    readonly createdAt: string;
    /** When the curator anchored the clock; null means never seen, which is what a seed fills. */
    firstSeenAt: string | null;
    /** The lifecycle state, a closed set; only `Restore` leaves `archived`. */
    state: "active" | "stale" | "archived";
    /** Exempts the skill from every transition. */
    pinned: boolean;
    /** Set on archive, cleared on any move to active or stale. */
    archivedAt: string | null;
    /** The maximum of the two activity stamps, derived at read time and never persisted. */
    readonly lastActivityAt: string | null;
}
