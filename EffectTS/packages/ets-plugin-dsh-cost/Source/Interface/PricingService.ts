import type Catalog from "@Interface/Catalog.js";
import type PricingPreview from "@Interface/PricingPreview.js";
import type RateRow from "@Interface/RateRow.js";
import type Revision from "@Interface/Revision.js";

/**
 * @module PricingService
 *
 * The versioned pricing-catalog surface the twin resolves through
 * ctx.costPricing (the research's section 7, "runtime pricing should be a
 * service, not a copied configuration object", with the two dates of
 * section 5 and the storage model of section 6): the catalogs and revisions
 * of the ledger's v7 valuation tables, the rate rows one revision carries,
 * the one write that publishes a revision, and the preview that prices one
 * session's recorded usage under a selected revision without persisting a
 * row.
 *
 * @remarks
 *
 * The contract is deliberately small and versioned rather than a copied
 * configuration object: `catalogs`, `revisions` and `rates` are the reads a
 * settings view lists, `publish` is the only write (one transaction that
 * inserts a published revision and its rate rows, or nothing at all), and
 * `preview` is the impact question the research asks before a publish -
 * affected calls, old total, new total, difference, unpriced components -
 * answered from recorded usage and never stored.
 *
 * Preview-first, publish second (research section 7): a draft revision is
 * previewable by definition, and a published revision is the only thing a
 * valuation may pin. The two dates hold throughout: Revision.CreatedAt is
 * when the system accepted the rate, RateRow.ValidFrom is when the rate
 * applies to usage, so a correction to a past period is a new revision
 * whose rate rows keep the original ValidFrom. Nothing observed is touched:
 * Price, Call, Allocation and Touch stay as captured, and only Revision and
 * RateRow receive rows from this service.
 */
/**
 * The versioned pricing-catalog service.
 */
export default interface PricingService {
	/**
	 * Every catalog the ledger carries, in creation order.
	 */
	catalogs(): readonly Catalog[];

	/**
	 * One catalog's revisions, newest first.
	 */
	revisions(CatalogId: number): readonly Revision[];

	/**
	 * One revision's rate rows in card order.
	 */
	rates(RevisionId: number): readonly RateRow[];

	/**
	 * The one write: publish one revision and its rate rows, or nothing.
	 */
	publish(
		CatalogId: number,
		BaseRevisionId: number | null,
		Reason: string,
		Rows: readonly RateRow[],
	): Revision;

	/**
	 * The re-pricing of one session under one revision (nothing persisted).
	 */
	preview(RevisionId: number, SessionId: string): PricingPreview;
}
