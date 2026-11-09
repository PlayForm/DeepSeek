export default interface CostFile {
    path: string;
    kind: string | null;
    stage: string | null;
    tool: string | null;
    branch: string | null;
    readBeforeEdit: boolean;
    direct: number;
    amortized: number;
    total: number;
    linesDelta: number | null;
    bytesDelta: number | null;
    durationMs: number | null;
    touched: boolean;
    at: number;
}
