export default interface CostVersionRow {
    versionId: number;
    hash: string | null;
    bytes: number | null;
    lines: number | null;
    observedAt: number;
    touches: number;
    firstAt: number | null;
    lastAt: number | null;
    kinds: readonly string[];
    sessions: number;
}
