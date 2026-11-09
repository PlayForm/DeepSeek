import type CostBuckets from "./Buckets.js";
import type CostStep from "./Step.js";
import type CostTally from "./Tally.js";
import type CostTokens from "./Tokens.js";
export default interface CostTurn {
    turn: number;
    at: number;
    endedAt: number;
    steps: readonly CostStep[];
    cost: CostBuckets;
    tokens: CostTokens;
    cacheHit: number | null;
    provider: string;
    model: string;
    files: readonly CostTally[];
    tools: readonly CostTally[];
    direct: number;
    amortized: number;
    saving: number;
    retries: number;
    errors: number;
    unpriced: number;
    currency: string;
    mixed: boolean;
}
