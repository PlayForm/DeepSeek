/**
 * @module Tokens
 *
 * The call's five token buckets plus the two totals.
 *
 * @remarks
 *
 * The shape is the Design.md section 9.5 one: `input` is the uncached remainder the ledger stores,
 * and `total` is the reader's sum of the four visible buckets, because the ledger's own figure
 * omits cache writes; `reported` carries that ledger figure but nothing renders it.
 */
export default interface CostTokens {
    /**
     * The uncached prompt tokens the ledger stores.
     */
    input: number;
    /**
     * The output tokens the ledger stores.
     */
    output: number;
    /**
     * The cache-read tokens the ledger stores.
     */
    cacheRead: number;
    /**
     * The cache-write tokens the ledger stores.
     */
    cacheWrite: number;
    /**
     * The reasoning tokens the ledger stores.
     */
    reasoning: number;
    /**
     * The reader's sum of the four visible buckets.
     */
    total: number;
    /**
     * The ledger's own figure, which omits cache writes; nothing renders it.
     */
    reported: number | null;
}
