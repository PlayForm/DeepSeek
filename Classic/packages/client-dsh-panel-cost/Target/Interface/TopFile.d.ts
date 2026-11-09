export default interface CostTopFile {
    path: string;
    direct: number;
    amortized: number;
    total: number;
    calls: number;
}
