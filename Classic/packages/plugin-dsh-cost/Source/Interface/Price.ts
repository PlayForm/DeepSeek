// Price - one effective-dated price row of the ledger's price book
// (Documentation/Plans/COST-TRACK-PLUGIN.md section 3): the rate columns are
// per million tokens in the row's own currency, and an absent optional rate
// is an unpriced bucket charged at zero, never guessed. EffectiveFrom is the
// epoch millisecond the row came in force; a call is priced at the row with
// the greatest EffectiveFrom that is not after the call's time - never the
// newest row - so a historical invoice stays reproducible after a provider
// raises its rates. The factor layer's columns (section 17.1): TierFrom and
// TierTo bound one tier of a marginal rate card (a NULL TierTo is the open
// top tier), and a NULL Mode or Region means "any mode" or "any region", so
// the most specific row in force prices the call.
//
// Window names the row's time-of-day card ('any' when it applies at every
// hour): the tier family is bound to it beside the effective date, the mode
// and the region, so a windowed card's bands are read inside that window
// only and never mixed with another window's bands.
//
// PriceId is the resolved row's own identity, and NULL is the UNPRICED
// resolution: no row matched, so the row's zero rates mean no rate exists,
// never that the rate is zero (research section 2.2 - a missing rate is
// unpriced, a known free rate is an explicit zero row). A caller that stores
// the resolved row's identity on a call writes PriceId NULL for the unpriced
// case, so the ledger's own PriceId column carries the distinction.
export default interface Price {
	readonly PriceId: number | null;
	readonly Provider: string;
	readonly Model: string;
	readonly Currency: string;
	readonly InputRate: number;
	readonly OutputRate: number;
	readonly CacheReadRate: number | null;
	readonly CacheWriteRate: number | null;
	readonly ReasoningRate: number | null;
	readonly EffectiveFrom: number;
	readonly TierFrom: number;
	readonly TierTo: number | null;
	readonly Mode: string;
	readonly Region: string | null;
	readonly Window: string;
}
