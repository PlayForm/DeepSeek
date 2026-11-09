export default interface ContributionRow {
    readonly SessionId: string;
    readonly Title: string | null;
    readonly Calls: number;
    readonly Direct: number;
    readonly Amortized: number;
    readonly Total: number;
    readonly Share: number;
    readonly FirstAt: number | null;
    readonly LastAt: number | null;
    readonly Models: readonly string[];
}
