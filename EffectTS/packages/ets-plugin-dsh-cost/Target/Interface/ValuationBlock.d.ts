import type { ValuationBasis } from "@Interface/ValuationSelection.js";
export default interface ValuationBlock {
    readonly Basis: ValuationBasis;
    readonly RevisionId: number;
    readonly PolicyVersion: string;
    readonly CalculatedAt: number;
    readonly Recorded: number;
    readonly Revised: number;
    readonly Difference: number;
    readonly Unpriced: number;
}
