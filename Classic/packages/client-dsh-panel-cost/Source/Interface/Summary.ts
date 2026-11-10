import type CostBuckets from "@Interface/Buckets.js";
import type CostTokens from "@Interface/Tokens.js";
import type CostTopFile from "@Interface/TopFile.js";

/**
 * @module Summary
 *
 * The whole-session aggregates the totals row and the footer band render.
 *
 * @remarks
 *
 * The shape is the Design.md sections 7.1 and 9.8 one: the summary always describes every call the
 * ledger holds for the session, never the loaded window. `tokens.total` and `cost.other` follow
 * the same computed rules as a call, `cacheHit` is the token-weighted rate or null when the
 * session served no prompt tokens, and `topFiles` is the route's SQL limit of five.
 */
export default interface CostSummary {
	/**
	 * The calls the ledger holds for the session.
	 */
	calls: number;
	/**
	 * How many of those calls the ledger priced.
	 */
	priced: number;
	/**
	 * How many of those calls the ledger left unpriced.
	 */
	unpriced: number;
	/**
	 * The turn rows the fold grouped.
	 */
	turns: number;
	/**
	 * The step rows the fold grouped.
	 */
	steps: number;
	/**
	 * The token buckets with `total` computed by the reader.
	 */
	tokens: CostTokens;
	/**
	 * The cost buckets with `other` computed by the reader.
	 */
	cost: CostBuckets;
	/**
	 * The whole session's direct money.
	 */
	direct: number;
	/**
	 * The whole session's amortized money.
	 */
	amortized: number;
	/**
	 * The whole session's signed net cache benefit.
	 */
	saving: number;
	/**
	 * The token-weighted cache rate, or null when the session served no prompt tokens.
	 */
	cacheHit: number | null;
	/**
	 * How many distinct files the session touched.
	 */
	files: number;
	/**
	 * The summary's currency.
	 */
	currency: string;
	/**
	 * Every currency the session used.
	 */
	currencies: readonly string[];
	/**
	 * The ranked most expensive files, the route's SQL limit of five.
	 */
	topFiles: readonly CostTopFile[];
}
