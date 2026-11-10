/**
 * @module Valuation
 *
 * One named interpretation of recorded usage: Basis says which question it
 * answers, RevisionId names the catalog revision it evaluates against, and the
 * derived money hangs off ValuationId.
 *
 * @remarks
 *
 * The shape follows the valuation model and the research's sections 4, 5, 8
 * and 9. The basis is 'as-recorded' (the revision pinned when the call was
 * priced), 'corrected-historical' (the latest accepted corrections, effective
 * at event time), 'current-rates' (the same usage at the rates in force at a
 * selected date) or 'scenario' (recorded usage held constant under a
 * hypothetical catalog). PolicyVersion names the attribution policy that
 * splits the money across files, and EvidenceCutoff pins the evidence scope
 * (NULL is the whole ledger) so a report exported yesterday cannot change when
 * a new conversation arrives today. Note is the free text the selector writes;
 * the derived money hangs off ValuationId in ValuationCost and
 * ValuationAllocation, and no recorded Call or Allocation row is ever
 * rewritten by a valuation.
 */
export default interface Valuation {
	/**
	 * The ledger's own valuation row id.
	 */
	readonly ValuationId: number;
	/**
	 * The basis the interpretation answers.
	 */
	readonly Basis: "as-recorded" | "corrected-historical" | "current-rates" | "scenario";
	/**
	 * The catalog revision the interpretation evaluates against.
	 */
	readonly RevisionId: number;
	/**
	 * The attribution policy that splits the money across files.
	 */
	readonly PolicyVersion: string;
	/**
	 * The pinned evidence cutoff, null for the whole ledger.
	 */
	readonly EvidenceCutoff: number | null;
	/**
	 * When the interpretation was created, in epoch milliseconds.
	 */
	readonly CreatedAt: number;
	/**
	 * The free text the selector wrote, null when none.
	 */
	readonly Note: string | null;
}
