/**
 * @module PricingPreview
 *
 * One revision's impact on one session's recorded usage: how many calls the
 * read saw, how many the revision can price and how many it cannot, the
 * money the ledger recorded for the priced calls, the money the selected
 * revision gives those same calls, and the difference between the two in
 * one currency.
 *
 * @remarks
 * A call the revision cannot price - no rate row, or a row in another
 * currency - counts as unpriced and is excluded from BOTH totals, because a
 * missing rate is unpriced and never a zero, and adding it would fabricate
 * the difference. The preview is computed and never stored: nothing is
 * inserted into Valuation, ValuationCost or ValuationAllocation.
 */

/**
 * One session's pricing preview.
 */
export default interface PricingPreview {
	/**
	 * The session the preview re-priced.
	 */
	readonly SessionId: string;

	/**
	 * The calls the read saw.
	 */
	readonly Calls: number;

	/**
	 * The calls the revision prices.
	 */
	readonly Priced: number;

	/**
	 * The calls the revision cannot price.
	 */
	readonly Unpriced: number;

	/**
	 * The recorded money of the priced calls.
	 */
	readonly Current: number;

	/**
	 * The revision's money for the same calls.
	 */
	readonly Revised: number;

	/**
	 * The difference between the two totals.
	 */
	readonly Difference: number;

	/**
	 * The one currency both totals are in.
	 */
	readonly Currency: string;
}
