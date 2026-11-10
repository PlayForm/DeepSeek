import type CostBuckets from "./Buckets.js";
import type CostTokens from "./Tokens.js";
import type CostTopFile from "./TopFile.js";
/**
 * @module Summary
 *
 * The whole-session aggregates the totals row and the footer band render: the
 * counts, the token and cost buckets, the money, the currency facts and the
 * top files.
 *
 * @remarks
 *
 * The shape follows Design.md sections 7.1 and 9.8. The summary always
 * describes every call the ledger holds for the session, never the loaded
 * window. `tokens.total` and `cost.other` follow the same computed rules as a
 * call, `cacheHit` is the token-weighted rate or null when the session served
 * no prompt tokens, and `topFiles` is the route's SQL limit of five.
 */
/**
 * The whole-session aggregates, computed over every recorded call.
 */
export default interface CostSummary {
    /**
     * Every call the ledger holds for the session.
     */
    calls: number;
    /**
     * How many carried a price row.
     */
    priced: number;
    /**
     * How many did not.
     */
    unpriced: number;
    /**
     * The distinct turns the session's calls ran in.
     */
    turns: number;
    /**
     * The count of the session's calls.
     */
    steps: number;
    /**
     * The token buckets, with the total computed by the reader.
     */
    tokens: CostTokens;
    /**
     * The cost buckets, with the residual computed by the reader.
     */
    cost: CostBuckets;
    /**
     * The session's summed direct money.
     */
    direct: number;
    /**
     * The session's summed amortized money.
     */
    amortized: number;
    /**
     * The summed cache-split saving.
     */
    saving: number;
    /**
     * The token-weighted cache-hit rate, null with no prompt tokens.
     */
    cacheHit: number | null;
    /**
     * The distinct files the session's allocations priced.
     */
    files: number;
    /**
     * The dominant currency of the session's calls.
     */
    currency: string;
    /**
     * The distinct currencies the session's calls carried.
     */
    currencies: readonly string[];
    /**
     * The top five files by cost, the route's SQL limit.
     */
    topFiles: readonly CostTopFile[];
}
