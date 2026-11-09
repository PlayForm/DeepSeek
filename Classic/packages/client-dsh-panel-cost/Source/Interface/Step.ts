// CostStep - one step row: the ledger call of one (turn, step) grain plus
// the token-weighted cache hit the fold computes once and the markers read.
import type CostCall from "@Interface/Call";

export default interface CostStep extends CostCall {
	cacheHit: number | null;
}
