/**
 * @module Buckets
 *
 * The call's six cost columns plus the residual.
 *
 * @remarks
 *
 * The shape is the Design.md section 9.6 one: every bucket is the money the ledger stored for one
 * priced bucket, `total` is the authoritative CostTotal, and `other` is the residual
 * `max(0, total - cacheRead - input - output)` so the four bar segments always add up to the total.
 */
export default interface CostBuckets {
	/**
	 * The prompt money the ledger stored for the bucket.
	 */
	input: number;
	/**
	 * The output money the ledger stored for the bucket.
	 */
	output: number;
	/**
	 * The cache-read money the ledger stored for the bucket.
	 */
	cacheRead: number;
	/**
	 * The cache-write money the ledger stored for the bucket.
	 */
	cacheWrite: number;
	/**
	 * The reasoning money the ledger stored for the bucket.
	 */
	reasoning: number;
	/**
	 * The authoritative CostTotal the ledger recorded.
	 */
	total: number;
	/**
	 * The residual `max(0, total - cacheRead - input - output)` the bar reads.
	 */
	other: number;
}
