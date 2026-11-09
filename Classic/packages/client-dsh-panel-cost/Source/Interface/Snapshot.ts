// CostSnapshot - the object the fold publishes and the table renders: the
// turn rows oldest first, the summed step count, and the session summary
// carried verbatim from the route so the strip and the totals row always
// describe the whole session, never just the loaded window.
import type CostSummary from "@Interface/Summary";
import type CostTurn from "@Interface/Turn";

export default interface CostSnapshot {
	turns: readonly CostTurn[];
	steps: number;
	summary: CostSummary;
}
