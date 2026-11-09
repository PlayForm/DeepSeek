// PricingService - the versioned pricing-catalog surface the UI and the
// readers resolve through ctx.get("costPricing") (Temporary/Cost-Research/
// Plan.md lane B4c; the research's section 7, "runtime pricing should be a
// service, not a copied configuration object", with the two dates of section
// 5 and the storage model of section 6): the catalogs and revisions of the
// ledger's v5 valuation tables, the rate rows one revision carries, the one
// write that publishes a revision, and the preview that prices one session's
// recorded usage under a selected revision without persisting a row.
//
// The contract is deliberately small and versioned rather than a copied
// configuration object: `catalogs`, `revisions` and `rates` are the reads a
// settings view lists, `publish` is the only write (one transaction that
// inserts a published revision and its rate rows, or nothing at all), and
// `preview` is the impact question the research asks before a publish -
// affected calls, old total, new total, difference, unpriced components -
// answered from recorded usage and never stored.
//
// Preview-first, publish second (research section 7): a draft revision is
// previewable by definition, and a published revision is the only thing a
// valuation may pin. The two dates hold throughout: Revision.CreatedAt is
// when the system accepted the rate, RateRow.ValidFrom is when the rate
// applies to usage, so a correction to a past period is a new revision whose
// rate rows keep the original ValidFrom.
import type Catalog from "./Catalog.js";
import type RateRow from "./RateRow.js";
import type Revision from "./Revision.js";

// PricingPreview - one revision's impact on one session's recorded usage: how
// many calls the read saw, how many the revision can price and how many it
// cannot, the money the ledger recorded for the priced calls, the money the
// selected revision gives those same calls, and the difference between the
// two in one currency. A call the revision cannot price - no rate row, or a
// row in another currency - counts as unpriced and is excluded from BOTH
// totals, because a missing rate is unpriced and never a zero, and adding it
// would fabricate the difference. The type is local to this file and is named
// through the service's own preview signature.
export interface PricingPreview {
	readonly sessionId: string;
	readonly calls: number;
	readonly priced: number;
	readonly unpriced: number;
	readonly current: number;
	readonly revised: number;
	readonly difference: number;
	readonly currency: string;
}

export default interface PricingService {
	catalogs(): readonly Catalog[];
	revisions(CatalogId: number): readonly Revision[];
	rates(RevisionId: number): readonly RateRow[];
	publish(
		CatalogId: number,
		BaseRevisionId: number | null,
		Reason: string,
		Rows: readonly RateRow[],
	): Revision;
	preview(RevisionId: number, SessionId: string): PricingPreview;
}
