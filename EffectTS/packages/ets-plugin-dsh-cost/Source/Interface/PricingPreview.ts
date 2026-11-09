// PricingPreview - one revision's impact on one session's recorded usage: how
// many calls the read saw, how many the revision can price and how many it
// cannot, the money the ledger recorded for the priced calls, the money the
// selected revision gives those same calls, and the difference between the
// two in one currency. A call the revision cannot price - no rate row, or a
// row in another currency - counts as unpriced and is excluded from BOTH
// totals, because a missing rate is unpriced and never a zero, and adding it
// would fabricate the difference. The preview is computed and never stored:
// nothing is inserted into Valuation, ValuationCost or ValuationAllocation.
export default interface PricingPreview {
	readonly SessionId: string;
	readonly Calls: number;
	readonly Priced: number;
	readonly Unpriced: number;
	readonly Current: number;
	readonly Revised: number;
	readonly Difference: number;
	readonly Currency: string;
}
