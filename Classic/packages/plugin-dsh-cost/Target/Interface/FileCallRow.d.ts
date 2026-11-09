export default interface CostFileCallRow {
    callId: number;
    turn: number;
    step: number;
    at: number;
    provider: string;
    model: string;
    direct: number;
    amortized: number;
    total: number;
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
    stage: string | null;
    touched: boolean;
}
