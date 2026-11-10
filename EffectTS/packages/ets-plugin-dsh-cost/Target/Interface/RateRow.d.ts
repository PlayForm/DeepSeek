/**
 * @module RateRow
 *
 * One effective-dated rate inside a pricing revision (the valuation model;
 * the research's sections 5 and 6): the same provider, model, currency and
 * per-million-token columns the capture-time Price row carries - input and
 * output required, cache read, cache write and reasoning optional because
 * an absent rate is an unpriced bucket and never a guessed zero - plus the
 * window, the tier bounds, the mode and the region that make one rate card
 * a family of rows.
 *
 * @remarks
 *
 * The effective interval is half-open (ValidFrom <= at < ValidTo, a NULL
 * ValidTo is the open end) and it lives inside an immutable revision, so a
 * rate is corrected by publishing a new revision, never by editing this
 * row. Note is the free-text provenance the rate editor writes; the
 * catalog's name and the revision's reason carry the rest, which is why the
 * Price row's Source column has no counterpart here. RateRowId and
 * RevisionId are placeholders on a caller's row - the ledger assigns both
 * on publish.
 */
/**
 * One rate row of one revision.
 */
export default interface RateRow {
    /**
     * The ledger's row id (a placeholder on a caller's row).
     */
    readonly RateRowId: number;
    /**
     * The revision the rate belongs to (a placeholder on a caller's row).
     */
    readonly RevisionId: number;
    /**
     * The provider the rate prices.
     */
    readonly Provider: string;
    /**
     * The model the rate prices.
     */
    readonly Model: string;
    /**
     * The rate's currency.
     */
    readonly Currency: string;
    /**
     * The uncached input rate per million tokens.
     */
    readonly InputRate: number;
    /**
     * The output rate per million tokens.
     */
    readonly OutputRate: number;
    /**
     * The cache-read rate per million tokens (null is unpriced).
     */
    readonly CacheReadRate: number | null;
    /**
     * The cache-write rate per million tokens (null is unpriced).
     */
    readonly CacheWriteRate: number | null;
    /**
     * The reasoning rate per million tokens (null is unpriced).
     */
    readonly ReasoningRate: number | null;
    /**
     * The epoch ms the rate applies from (inclusive).
     */
    readonly ValidFrom: number;
    /**
     * The epoch ms the rate applies until (exclusive; null is open).
     */
    readonly ValidTo: number | null;
    /**
     * The pricing mode the rate prices in.
     */
    readonly Mode: string;
    /**
     * The region the rate prices (null is any region).
     */
    readonly Region: string | null;
    /**
     * The time-of-day window the rate prices in.
     */
    readonly Window: string;
    /**
     * The tier's floor.
     */
    readonly TierFrom: number;
    /**
     * The tier's ceiling (null is the open top tier).
     */
    readonly TierTo: number | null;
    /**
     * The free-text provenance the rate editor writes.
     */
    readonly Note: string | null;
}
