/**
 * @module Buckets
 *
 * The call's six cost columns plus the residual: every bucket is the money the
 * ledger stored for one priced bucket, and the segments add up to the total.
 *
 * @remarks
 * The shape follows Design.md section 9.6. `total` is the authoritative
 * CostTotal, and `other` is the residual `max(0, total - cacheRead - input -
 * output)` so the four bar segments always add up to the total.
 */
export default interface CostBuckets {
    /**
     * The uncached input bucket's money.
     */
    input: number;
    /**
     * The output bucket's money.
     */
    output: number;
    /**
     * The cache-read bucket's money.
     */
    cacheRead: number;
    /**
     * The cache-write bucket's money.
     */
    cacheWrite: number;
    /**
     * The reasoning bucket's money.
     */
    reasoning: number;
    /**
     * The authoritative CostTotal.
     */
    total: number;
    /**
     * The residual `max(0, total - cacheRead - input - output)`.
     */
    other: number;
}
