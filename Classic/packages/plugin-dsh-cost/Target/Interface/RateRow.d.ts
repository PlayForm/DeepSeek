/**
 * @module RateRow
 *
 * One effective-dated rate inside a pricing revision: the same provider,
 * model, currency and per-million-token columns the capture-time Price row
 * carries, plus the window, tier bounds, mode and region that make one rate
 * card a family of rows.
 *
 * @remarks
 *
 * The row follows the valuation model and the research's sections 5 and 6.
 * Input and output rates are required; cache read, cache write and reasoning
 * are optional because an absent rate is an unpriced bucket and never a guessed
 * zero. The effective interval is half-open (ValidFrom <= at < ValidTo, a NULL
 * ValidTo is the open end) and it lives inside an immutable revision, so a rate
 * is corrected by publishing a new revision, never by editing this row. Note is
 * the free-text provenance the rate editor writes; the catalog's name and the
 * revision's reason carry the rest, which is why the Price row's Source column
 * has no counterpart here.
 */
export default interface RateRow {
    /**
     * The ledger's own rate row id, assigned by the insert.
     */
    readonly RateRowId: number;
    /**
     * The revision the rate row belongs to, assigned by the insert.
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
     * The currency the rates are in.
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
     * The cache-read rate, null when the bucket is unpriced.
     */
    readonly CacheReadRate: number | null;
    /**
     * The cache-write rate, null when the bucket is unpriced.
     */
    readonly CacheWriteRate: number | null;
    /**
     * The reasoning rate, null when the bucket is unpriced.
     */
    readonly ReasoningRate: number | null;
    /**
     * The epoch millisecond the rate applies from.
     */
    readonly ValidFrom: number;
    /**
     * The open end of the half-open interval, null for forever.
     */
    readonly ValidTo: number | null;
    /**
     * The pricing mode the rate names, "standard" when generic.
     */
    readonly Mode: string;
    /**
     * The region the rate names, null for any region.
     */
    readonly Region: string | null;
    /**
     * The time-of-day window the rate's card belongs to.
     */
    readonly Window: string;
    /**
     * The tier's floor in tokens.
     */
    readonly TierFrom: number;
    /**
     * The tier's ceiling, null for the open top tier.
     */
    readonly TierTo: number | null;
    /**
     * The free-text provenance, or the conditional marker.
     */
    readonly Note: string | null;
}
