/**
 * @module Tally
 *
 * One pill of the files or tools cell.
 *
 * @remarks
 *
 * The pill carries the key, how many steps (files) or touched files (tools) it counts, the money it
 * sums, the summed line delta, and the stage tone the largest entry carries.
 */
export default interface CostTally {
	/**
	 * The pill's key, a file path or a tool name.
	 */
	key: string;
	/**
	 * How many steps (files) or touched files (tools) the pill counts.
	 */
	count: number;
	/**
	 * The money the pill sums.
	 */
	total: number;
	/**
	 * The direct share of the money the pill sums.
	 */
	direct: number;
	/**
	 * The amortized share of the money the pill sums.
	 */
	amortized: number;
	/**
	 * The summed line delta.
	 */
	lines: number;
	/**
	 * The stage tone the largest entry carries, or null.
	 */
	stage: string | null;
}
