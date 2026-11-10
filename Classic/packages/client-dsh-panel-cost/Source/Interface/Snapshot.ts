import type CostSummary from "@Interface/Summary";
import type CostTurn from "@Interface/Turn";

/**
 * @module Snapshot
 *
 * The object the fold publishes and the table renders.
 *
 * @remarks
 *
 * The turn rows oldest first, the summed step count, and the session summary carried verbatim from
 * the route so the strip and the totals row always describe the whole session, never just the
 * loaded window.
 */
export default interface CostSnapshot {
	/**
	 * The turn rows, oldest first.
	 */
	turns: readonly CostTurn[];
	/**
	 * The summed step count of every turn.
	 */
	steps: number;
	/**
	 * The session summary, carried verbatim from the route.
	 */
	summary: CostSummary;
}
