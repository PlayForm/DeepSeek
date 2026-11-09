export default interface CostFileRow {
    path: string;
    touches: number;
    reads: number;
    edits: number;
    writes: number;
    searches: number;
    added: number;
    removed: number;
    bytesAdded: number;
    bytesRemoved: number;
    direct: number;
    amortized: number;
    total: number;
    lifetime: number | null;
    before: number | null;
    turn: number | null;
    stages: readonly string[];
    verdict: string | null;
    readBeforeEdit: boolean;
    firstAt: number | null;
    lastAt: number | null;
}
