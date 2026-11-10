/**
 * @module VersionRow
 *
 * One CostVersionRow per content version of one file path: the version's own
 * identity and content evidence beside the touches bound to it, so a file's
 * content chain is visible beside its cost.
 *
 * @remarks
 *
 * The row is the engine's third file-scoped read; it follows the research's
 * section 3.C, where current-artifact attribution needs content lineage, and
 * section 4, the file-observation contract whose before and after hashes this
 * grain stores. It carries the version's id, the SHORT PREFIX of the SHA-256
 * content hash the drain measured (the first twelve hex characters, the
 * git-style short form, so the row reads as a version label rather than a
 * paragraph), the encoded byte length and the line count of that exact
 * content, and the instant the ledger first observed it - and the touches
 * bound to it: how many touch rows carry this version as their VersionId, the
 * first and last of their times, the distinct kinds they recorded (read,
 * write, edit, delete or search, sorted) and the distinct session count of the
 * conversations that produced them.
 *
 * A VERSION WITH NO BOUND TOUCH is a row, not a missing row: the after version
 * of a write is bound only when a later touch comes, so it answers a zero
 * touch count, null first and last times and an empty kind list. `hash`,
 * `bytes` and `lines` stay null when the ledger stored no value for them, and
 * `observedAt` is the ledger's own clock for the observation, never a caller
 * guess. Every field is read-only: the ledger is the only writer, and this row
 * is the read that presents its chain.
 */
export default interface CostVersionRow {
    /**
     * The ledger's own version row id.
     */
    versionId: number;
    /**
     * The first twelve hex characters of the SHA-256 content hash.
     */
    hash: string | null;
    /**
     * The UTF-8 encoded byte length of the exact content.
     */
    bytes: number | null;
    /**
     * The line count of the exact content, counted the edit grain's way.
     */
    lines: number | null;
    /**
     * When the ledger first observed the content, from its own clock.
     */
    observedAt: number;
    /**
     * The touch rows that carry this version as their VersionId.
     */
    touches: number;
    /**
     * The first bound touch's instant, null when none is bound.
     */
    firstAt: number | null;
    /**
     * The last bound touch's instant, null when none is bound.
     */
    lastAt: number | null;
    /**
     * The distinct touch kinds bound to the version, sorted.
     */
    kinds: readonly string[];
    /**
     * The distinct sessions that produced the bound touches.
     */
    sessions: number;
}
