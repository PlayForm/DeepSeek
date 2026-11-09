export default interface CostContributionRow {
    sessionId: string;
    title: string | null;
    calls: number;
    direct: number;
    amortized: number;
    total: number;
    share: number;
    firstAt: number | null;
    lastAt: number | null;
    models: readonly string[];
}
