export type ValuationBasis = "as-recorded" | "corrected" | "current" | "scenario";
export default interface ValuationSelection {
    readonly basis: ValuationBasis;
    readonly revisionId?: number;
}
