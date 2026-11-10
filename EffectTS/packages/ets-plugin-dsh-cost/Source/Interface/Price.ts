/**
 * @module Price
 *
 * One effective-dated price row of the ledger's price book
 * (Documentation/Plans/COST-TRACK-PLUGIN.md section 3): the rate columns
 * are per million tokens in the row's own currency, and an absent optional
 * rate is an unpriced bucket charged at zero, never guessed.
 *
 * @remarks
 *
 * EffectiveFrom is the epoch millisecond the row came in force; a call is
 * priced at the row with the greatest EffectiveFrom that is not after the
 * call's time - never the newest row - so a historical invoice stays
 * reproducible after a provider raises its rates. The factor layer's
 * columns (section 17.1): TierFrom and TierTo bound one tier of a marginal
 * rate card (a NULL TierTo is the open top tier), and a NULL Mode or Region
 * means "any mode" or "any region", so the most specific row in force
 * prices the call.
 */

/**
 * One effective-dated price row.
 */
export default interface Price {
	/**
	 * The provider the row prices.
	 */
	readonly Provider: string;

	/**
	 * The model the row prices.
	 */
	readonly Model: string;

	/**
	 * The row's currency.
	 */
	readonly Currency: string;

	/**
	 * The uncached input rate per million tokens.
	 */
	readonly InputRate: number;

	/**
	 * The output rate per million tokens.
	 */
	readonly OutputRate: number;

	/**
	 * The cache-read rate per million tokens (null is unpriced).
	 */
	readonly CacheReadRate: number | null;

	/**
	 * The cache-write rate per million tokens (null is unpriced).
	 */
	readonly CacheWriteRate: number | null;

	/**
	 * The reasoning rate per million tokens (null is unpriced).
	 */
	readonly ReasoningRate: number | null;

	/**
	 * The epoch ms the row came in force.
	 */
	readonly EffectiveFrom: number;

	/**
	 * The tier's floor.
	 */
	readonly TierFrom: number;

	/**
	 * The tier's ceiling (null is the open top tier).
	 */
	readonly TierTo: number | null;

	/**
	 * The pricing mode the row prices (the empty generic applies to any).
	 */
	readonly Mode: string;

	/**
	 * The region the row prices (null is any region).
	 */
	readonly Region: string | null;
}
