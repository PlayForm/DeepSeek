import type CostBuckets from "@Interface/Buckets";
import type CostStep from "@Interface/Step";
import type CostTally from "@Interface/Tally";
import type CostTokens from "@Interface/Tokens";

/**
 * @module Turn
 *
 * One turn row of the table: the group of steps the ledger stored under one Turn number, with
 * every aggregate the eleven columns and the markers read. A turn is never a ledger row; the fold
 * builds it.
 */
export default interface CostTurn {
	/**
	 * The turn number the group covers.
	 */
	turn: number;
	/**
	 * The turn's first call instant in epoch milliseconds.
	 */
	at: number;
	/**
	 * The turn's last call instant in epoch milliseconds.
	 */
	endedAt: number;
	/**
	 * The steps the turn groups, ascending by step.
	 */
	steps: readonly CostStep[];
	/**
	 * The turn's summed cost buckets.
	 */
	cost: CostBuckets;
	/**
	 * The turn's summed token buckets.
	 */
	tokens: CostTokens;
	/**
	 * The token-weighted cache rate of the turn's calls, or null.
	 */
	cacheHit: number | null;
	/**
	 * The provider of the turn's dominant call.
	 */
	provider: string;
	/**
	 * The model of the turn's dominant call.
	 */
	model: string;
	/**
	 * The file tallies the turn's calls carried.
	 */
	files: readonly CostTally[];
	/**
	 * The tool tallies the turn's touched files carry.
	 */
	tools: readonly CostTally[];
	/**
	 * The turn's summed direct money.
	 */
	direct: number;
	/**
	 * The turn's summed amortized money.
	 */
	amortized: number;
	/**
	 * The turn's summed net cache benefit.
	 */
	saving: number;
	/**
	 * How many retry attempts the turn's calls spent.
	 */
	retries: number;
	/**
	 * How many calls of the turn errored.
	 */
	errors: number;
	/**
	 * How many calls of the turn are unpriced.
	 */
	unpriced: number;
	/**
	 * The turn's currency.
	 */
	currency: string;
	/**
	 * Whether the turn's calls reported more than one currency.
	 */
	mixed: boolean;
}
