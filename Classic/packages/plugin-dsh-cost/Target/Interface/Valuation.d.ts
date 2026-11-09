export default interface Valuation {
    readonly ValuationId: number;
    readonly Basis: "as-recorded" | "corrected-historical" | "current-rates" | "scenario";
    readonly RevisionId: number;
    readonly PolicyVersion: string;
    readonly EvidenceCutoff: number | null;
    readonly CreatedAt: number;
    readonly Note: string | null;
}
