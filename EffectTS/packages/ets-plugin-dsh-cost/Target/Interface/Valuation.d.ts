/**
 * @module Valuation
 *
 * One named interpretation of recorded usage (the valuation model; the
 * research's sections 4, 5, 8 and 9): Basis says which question it answers
 * - 'as-recorded' (the revision pinned when the call was priced),
 * 'corrected-historical' (the latest accepted corrections, effective at
 * event time), 'current-rates' (the same usage at the rates in force at a
 * selected date) or 'scenario' (recorded usage held constant under a
 * hypothetical catalog).
 *
 * @remarks
 *
 * RevisionId names the catalog revision it evaluates against, PolicyVersion
 * names the attribution policy that splits the money across files, and
 * EvidenceCutoff pins the evidence scope (NULL is the whole ledger) so a
 * report exported yesterday cannot change when a new conversation arrives
 * today. Note is the free text the selector writes; the derived money hangs
 * off ValuationId in ValuationCost and ValuationAllocation, and no recorded
 * Call or Allocation row is ever rewritten by a valuation. This is the
 * STORED row: the comparison a read carries beside the recorded money is
 * Interface/ValuationBlock.
 */
/**
 * One stored valuation row.
 */
export default interface Valuation {
    /**
     * The valuation's ledger row id.
     */
    readonly ValuationId: number;
    /**
     * The question the valuation answers.
     */
    readonly Basis: "as-recorded" | "corrected-historical" | "current-rates" | "scenario";
    /**
     * The catalog revision the valuation evaluates against.
     */
    readonly RevisionId: number;
    /**
     * The attribution policy that splits the money across files.
     */
    readonly PolicyVersion: string;
    /**
     * The evidence cutoff (null is the whole ledger).
     */
    readonly EvidenceCutoff: number | null;
    /**
     * When the valuation was stored (epoch ms).
     */
    readonly CreatedAt: number;
    /**
     * The free text the selector writes.
     */
    readonly Note: string | null;
}
