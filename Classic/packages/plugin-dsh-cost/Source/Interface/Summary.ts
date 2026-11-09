// Summary - the whole-session aggregates the totals row and the footer band
// render (Design.md sections 7.1 and 9.8): the summary always describes
// every call the ledger holds for the session, never the loaded window.
// `tokens.total` and `cost.other` follow the same computed rules as a call,
// `cacheHit` is the token-weighted rate or null when the session served no
// prompt tokens, and `topFiles` is the route's SQL limit of five.
import type CostBuckets from "@Interface/Buckets.js";
import type CostTokens from "@Interface/Tokens.js";
import type CostTopFile from "@Interface/TopFile.js";

export default interface CostSummary {
	calls: number;
	priced: number;
	unpriced: number;
	turns: number;
	steps: number;
	tokens: CostTokens;
	cost: CostBuckets;
	direct: number;
	amortized: number;
	saving: number;
	cacheHit: number | null;
	files: number;
	currency: string;
	currencies: readonly string[];
	topFiles: readonly CostTopFile[];
}
