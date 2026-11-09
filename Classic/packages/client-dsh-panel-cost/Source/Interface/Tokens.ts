// Tokens - the call's five token buckets plus the two totals (Design.md
// section 9.5): `input` is the uncached remainder the ledger stores, and
// `total` is the reader's sum of the four visible buckets, because the
// ledger's own figure omits cache writes; `reported` carries that ledger
// figure but nothing renders it.
export default interface CostTokens {
	input: number;
	output: number;
	cacheRead: number;
	cacheWrite: number;
	reasoning: number;
	total: number;
	reported: number | null;
}
