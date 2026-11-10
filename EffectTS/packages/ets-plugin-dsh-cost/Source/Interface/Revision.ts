/**
 * @module Revision
 *
 * One immutable revision of a pricing catalog (the valuation model; the
 * research's section 5): a revision is never edited in place, because
 * editing a published rate would rewrite what a past invoice was calculated
 * from.
 *
 * @remarks
 *
 * ParentRevisionId names the revision this one corrects (NULL for the first
 * revision of a catalog), so a correction to a past period is a new
 * revision that supersedes its parent while its rate rows keep the original
 * ValidFrom - the two dates: CreatedAt is when the system ACCEPTED the
 * rate, RateRow.ValidFrom is when the rate APPLIES to usage. Reason is the
 * correction reason the audit reads, and Status is 'draft' until the
 * revision is published: a draft is a preview, and a published revision is
 * the only thing a valuation may pin. The row mapper narrows Status
 * fail-closed - anything but the literal 'published' reads as a draft.
 */

/**
 * One catalog revision.
 */
export default interface Revision {
	/**
	 * The revision's ledger row id.
	 */
	readonly RevisionId: number;

	/**
	 * The catalog the revision belongs to.
	 */
	readonly CatalogId: number;

	/**
	 * The revision this one corrects (null for a catalog's first revision).
	 */
	readonly ParentRevisionId: number | null;

	/**
	 * When the system accepted the rate (epoch ms).
	 */
	readonly CreatedAt: number;

	/**
	 * The correction reason the audit reads.
	 */
	readonly Reason: string;

	/**
	 * The revision's status (narrowed fail-closed).
	 */
	readonly Status: "draft" | "published";
}
