import type CostSummary from "./Summary.js";
import type CostTurn from "./Turn.js";
export default interface CostSnapshot {
    turns: readonly CostTurn[];
    steps: number;
    summary: CostSummary;
}
