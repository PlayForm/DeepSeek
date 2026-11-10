import type CostCall from "./Call.js";
/**
 * @module Step
 *
 * One step row: the ledger call of one (turn, step) grain plus the token-weighted cache hit the
 * fold computes once and the markers read.
 */
export default interface CostStep extends CostCall {
    /**
     * The token-weighted cache hit the fold computed for the call, or null.
     */
    cacheHit: number | null;
}
