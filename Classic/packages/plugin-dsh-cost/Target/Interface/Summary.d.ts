import type CostBuckets from "./Buckets.js";
import type CostTokens from "./Tokens.js";
import type CostTopFile from "./TopFile.js";
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
