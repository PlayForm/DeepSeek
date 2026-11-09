// Revision - one immutable revision of a pricing catalog (the valuation
// model; the research's section 5): a revision is never edited in place,
// because editing a published rate would rewrite what a past invoice was
// calculated from. ParentRevisionId names the revision this one corrects
// (NULL for the first revision of a catalog), so a correction to a past
// period is a new revision that supersedes its parent while its rate rows
// keep the original ValidFrom - the two dates: CreatedAt is when the system
// ACCEPTED the rate, RateRow.ValidFrom is when the rate APPLIES to usage.
// Reason is the correction reason the audit reads, and Status is 'draft'
// until the revision is published: a draft is a preview, and a published
// revision is the only thing a valuation may pin.
export default interface Revision {
	readonly RevisionId: number;
	readonly CatalogId: number;
	readonly ParentRevisionId: number | null;
	readonly CreatedAt: number;
	readonly Reason: string;
	readonly Status: "draft" | "published";
}
