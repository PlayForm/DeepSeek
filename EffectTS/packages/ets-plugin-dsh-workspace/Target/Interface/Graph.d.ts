/** The node kinds the W1 graph parses. */
export type NodeKind = "File" | "Symbol" | "Block" | "Test" | "DocSection";
/** The edge kinds the W1 graph parses. */
export type EdgeKind = "contains" | "imports";
/** A 1-based, inclusive source span. */
export interface Span {
    startLine: number;
    endLine: number;
}
/** One graph node: stable id, content-derived fingerprint, version stamp. */
export interface Node {
    id: string;
    kind: NodeKind;
    path: string;
    name?: string;
    language?: "typescript" | "javascript" | "markdown";
    span?: Span;
    fingerprint: string;
    version: string;
}
/** One graph edge: kind, endpoints, source span. */
export interface Edge {
    kind: EdgeKind;
    from: string;
    to: string;
    span?: Span;
}
/** The outcome of indexing one file. */
export interface IndexOutcome {
    path: string;
    status: "indexed" | "skipped" | "failed";
    nodes: number;
    edges: number;
    version?: string;
    reason?: string;
}
/** The counts one workspace index call returns (the graph service's own
 * summary shape, WAVE-1-BRIEF.md section 4.3 plus the indexing trigger). */
export interface IndexSummary {
    indexed: number;
    skipped: number;
    failed: number;
    files: number;
}
/** The find query (name, pattern, kind, limit). */
export interface FindQuery {
    name?: string | undefined;
    pattern?: string | undefined;
    kind?: NodeKind | undefined;
    limit?: number | undefined;
}
/** The expansion result: the neighbor nodes and the connecting edges. */
export interface Expansion {
    nodes: Node[];
    edges: Edge[];
}
/** The full graph snapshot with the index revision it was built from. */
export interface GraphSnapshot {
    indexRevision: string;
    nodes: Node[];
    edges: Edge[];
}
/** The graph statistics. */
export interface GraphStatistics {
    files: number;
    nodes: number;
    edges: number;
    indexRevision: string;
}
/** The workspaceGraph service surface (WAVE-1-BRIEF.md section 4.3). */
export interface WorkspaceGraph {
    indexFile(path: string): Promise<IndexOutcome>;
    /** The INDEXING TRIGGER: walk the root (default = the session cwd) and
     * index every candidate file; the counts are the graph service's. */
    indexWorkspace(root?: string, options?: {
        maxFiles?: number;
    }): Promise<IndexSummary>;
    removeFile(path: string): Promise<boolean>;
    getNode(id: string): Node | undefined;
    find(query: FindQuery): Node[];
    expand(id: string, options?: {
        kinds?: EdgeKind[];
        depth?: number;
    }): Expansion;
    snapshot(): GraphSnapshot;
    statistics(): GraphStatistics;
}
