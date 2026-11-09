export default interface CostModelRow {
    provider: string;
    model: string;
    calls: number;
    tokens: number;
    input: number;
    output: number;
    cacheRead: number;
    total: number;
}
