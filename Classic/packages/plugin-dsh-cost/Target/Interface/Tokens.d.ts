/**
 * @module Tokens
 *
 * The call's five token buckets plus the two totals: the reader's sum of the
 * four visible buckets beside the ledger's own reported figure.
 *
 * @remarks
 *
 * The shape follows Design.md section 9.5. `input` is the uncached remainder
 * the ledger stores, and `total` is the reader's sum of the four visible
 * buckets, because the ledger's own figure omits cache writes; `reported`
 * carries that ledger figure but nothing renders it.
 */
export default interface CostTokens {
    /**
     * The uncached remainder the ledger stores.
     */
    input: number;
    /**
     * The output tokens.
     */
    output: number;
    /**
     * The cache-read tokens.
     */
    cacheRead: number;
    /**
     * The cache-write tokens.
     */
    cacheWrite: number;
    /**
     * The reasoning tokens.
     */
    reasoning: number;
    /**
     * The reader's sum of the four visible buckets.
     */
    total: number;
    /**
     * The ledger's own figure, which omits cache writes.
     */
    reported: number | null;
}
