// Buckets - the call's six cost columns plus the residual (Design.md
// section 9.6): every bucket is the money the ledger stored for one priced
// bucket, `total` is the authoritative CostTotal, and `other` is the
// residual `max(0, total - cacheRead - input - output)` so the four bar
// segments always add up to the total.
export default interface CostBuckets {
	input: number;
	output: number;
	cacheRead: number;
	cacheWrite: number;
	reasoning: number;
	total: number;
	other: number;
}
