export default interface Outcome {
    path: string;
    status: "indexed" | "skipped" | "failed";
    nodes: number;
    edges: number;
    version?: string;
    reason?: string;
}
