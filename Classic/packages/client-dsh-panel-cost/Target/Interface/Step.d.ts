import type CostCall from "./Call.js";
export default interface CostStep extends CostCall {
    cacheHit: number | null;
}
