/**
 * @module Record
 *
 * One usage record: the thirteen fields the lifecycle and the report read, keyed by
 * skill name in the store and never stored inside a `SKILL.md`.
 *
 * @remarks
 *
 * `createdBy` is a POLICY FLAG, not a provenance claim: it answers "may autonomous
 * curation archive this?", not "who wrote it". A foreground create has no path that
 * would set the `learn` marker in this release, so the marker exists in the vocabulary
 * and opens no jurisdiction.
 *
 * The stamps are ISO-8601 strings rather than epoch numbers because the ledger, the
 * snapshot manifest, and the report are read by people, and one date format across all
 * four files is worth more than the arithmetic.
 *
 * `createdAt` and `lastActivityAt` are readonly for different reasons: the creation
 * stamp is history and must never be rewritten, and `lastActivityAt` is derived at read
 * time from the two activity stamps and never persisted, so a writer that set it would
 * be writing a value the next read recomputes.
 */
/**
 * The one usage record.
 */
export default interface Record {
    /**
     * The curation opt-in policy flag; only `"agent"` opens jurisdiction.
     */
    readonly createdBy: null | "agent" | "learn";
    /**
     * Observed loads through the `skill` tool.
     */
    useCount: number;
    /**
     * Successful `patch` and `support` writes.
     */
    patchCount: number;
    /**
     * Monotonic, incremented with `patchCount`.
     */
    patchGeneration: number;
    /**
     * The generation at the last use, clamped to `patchGeneration` on read.
     */
    lastReusedPatchGeneration: number;
    /**
     * The last use, ISO-8601 UTC, or null before the first.
     */
    lastUsedAt: string | null;
    /**
     * The last write, ISO-8601 UTC, or null before the first.
     */
    lastPatchedAt: string | null;
    /**
     * The creation stamp, and the anchor fallback when no activity stamp exists.
     */
    readonly createdAt: string;
    /**
     * When the curator anchored the clock; null means never seen, which is what a seed fills.
     */
    firstSeenAt: string | null;
    /**
     * The lifecycle state, a closed set; only `Restore` leaves `archived`.
     */
    state: "active" | "stale" | "archived";
    /**
     * Exempts the skill from every transition.
     */
    pinned: boolean;
    /**
     * Set on archive, cleared on any move to active or stale.
     */
    archivedAt: string | null;
    /**
     * The maximum of the two activity stamps, derived at read time and never persisted.
     */
    readonly lastActivityAt: string | null;
}
