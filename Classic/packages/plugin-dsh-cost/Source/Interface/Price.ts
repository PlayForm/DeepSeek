/**
 * @module Price
 *
 * One effective-dated price row of the ledger's price book: the rate columns
 * per million tokens, the tier bounds, the mode, region and window, and the
 * resolved row's identity.
 *
 * @remarks
 *
 * The row follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section 3. An
 * absent optional rate is an unpriced bucket charged at zero, never guessed.
 * EffectiveFrom is the epoch millisecond the row came in force; a call is
 * priced at the row with the greatest EffectiveFrom that is not after the
 * call's time - never the newest row - so a historical invoice stays
 * reproducible after a provider raises its rates. The factor layer's columns
 * (section 17.1): TierFrom and TierTo bound one tier of a marginal rate card
 * (a NULL TierTo is the open top tier), and a NULL Mode or Region means "any
 * mode" or "any region", so the most specific row in force prices the call.
 *
 * Window names the row's time-of-day card ('any' when it applies at every
 * hour): the tier family is bound to it beside the effective date, the mode and
 * the region, so a windowed card's bands are read inside that window only and
 * never mixed with another window's bands.
 *
 * PriceId is the resolved row's own identity, and NULL is the UNPRICED
 * resolution: no row matched, so the row's zero rates mean no rate exists,
 * never that the rate is zero (research section 2.2 - a missing rate is
 * unpriced, a known free rate is an explicit zero row). A caller that stores
 * the resolved row's identity on a call writes PriceId NULL for the unpriced
 * case, so the ledger's own PriceId column carries the distinction.
 */
export default interface Price {
	/**
	 * The resolved row's id, null for the unpriced resolution.
	 */
	readonly PriceId: number | null;
	/**
	 * The provider the row prices.
	 */
	readonly Provider: string;
	/**
	 * The model the row prices.
	 */
	readonly Model: string;
	/**
	 * The currency the row's rates are in.
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
	 * The cache-read rate per million tokens, null when unpriced.
	 */
	readonly CacheReadRate: number | null;
	/**
	 * The cache-write rate per million tokens, null when unpriced.
	 */
	readonly CacheWriteRate: number | null;
	/**
	 * The reasoning rate per million tokens, null when unpriced.
	 */
	readonly ReasoningRate: number | null;
	/**
	 * The epoch millisecond the row came in force.
	 */
	readonly EffectiveFrom: number;
	/**
	 * The tier's floor in tokens.
	 */
	readonly TierFrom: number;
	/**
	 * The tier's ceiling, null for the open top tier.
	 */
	readonly TierTo: number | null;
	/**
	 * The pricing mode the row names, "any" when generic.
	 */
	readonly Mode: string;
	/**
	 * The region the row names, null for any region.
	 */
	readonly Region: string | null;
	/**
	 * The time-of-day window the row's card belongs to.
	 */
	readonly Window: string;
}
