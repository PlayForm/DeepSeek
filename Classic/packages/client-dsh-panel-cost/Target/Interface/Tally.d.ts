export default interface CostTally {
    key: string;
    count: number;
    total: number;
    direct: number;
    amortized: number;
    lines: number;
    stage: string | null;
}
