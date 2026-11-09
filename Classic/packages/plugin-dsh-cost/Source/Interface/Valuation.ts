// Valuation - one named interpretation of recorded usage (the valuation
// model; the research's sections 4, 5, 8 and 9): Basis says which question it
// answers - 'as-recorded' (the revision pinned when the call was priced),
// 'corrected-historical' (the latest accepted corrections, effective at event
// time), 'current-rates' (the same usage at the rates in force at a selected
// date) or 'scenario' (recorded usage held constant under a hypothetical
// catalog). RevisionId names the catalog revision it evaluates against,
// PolicyVersion names the attribution policy that splits the money across
// files, and EvidenceCutoff pins the evidence scope (NULL is the whole
// ledger) so a report exported yesterday cannot change when a new
// conversation arrives today. Note is the free text the selector writes; the
// derived money hangs off ValuationId in ValuationCost and
// ValuationAllocation, and no recorded Call or Allocation row is ever
// rewritten by a valuation.
export default interface Valuation {
	readonly ValuationId: number;
	readonly Basis: "as-recorded" | "corrected-historical" | "current-rates" | "scenario";
	readonly RevisionId: number;
	readonly PolicyVersion: string;
	readonly EvidenceCutoff: number | null;
	readonly CreatedAt: number;
	readonly Note: string | null;
}
