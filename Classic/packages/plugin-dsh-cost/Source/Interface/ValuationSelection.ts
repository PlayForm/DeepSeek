// ValuationSelection - the caller's choice of cost basis for one read
// (Temporary/Cost-Research/Plan.md lane B4d; the research's sections 4 and 8):
// the four bases the panel offers and the catalog revision a non-recorded
// basis evaluates against. `as-recorded` answers what the ledger booked when
// the call was priced, `corrected` the latest accepted correction effective at
// event time, `current` the rates in force at the selected revision, and
// `scenario` a hypothetical book - all four price the same recorded usage and
// none of them rewrites a Call or an Allocation row.
//
// The selection carries the basis and the revision only. The research's shape
// also names the attribution policy version and an evidence cutoff, and both
// are ledger facts this build derives rather than caller input: the policy is
// the version the ledger's newest Valuation row declares (the v5 seed's own
// rule), and the cutoff is the whole ledger, because nothing is pinned into
// ValuationCost or ValuationAllocation yet.
//
// `revisionId` is optional because a basis may be named before a revision is
// chosen: a selection without one reads exactly as `as-recorded`, and only a
// selection that names both makes the envelope carry the valuation block. The
// revision must be a published or draft revision the ledger carries; the
// pricing service's preview owns that check and answers one actionable line.
export type ValuationBasis = "as-recorded" | "corrected" | "current" | "scenario";

export default interface ValuationSelection {
	readonly basis: ValuationBasis;
	readonly revisionId?: number;
}
