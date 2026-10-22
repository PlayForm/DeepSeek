export interface GraphNode {
    id: string;
    kind: "File" | "Symbol" | "Block" | "Test" | "DocSection";
    path: string;
    name?: string;
    language?: "typescript" | "javascript" | "markdown";
    span?: {
        startLine: number;
        endLine: number;
    };
    fingerprint: string;
    version: string;
}
export interface GraphEdgeRecord {
    kind: "contains" | "imports";
    from: string;
    to: string;
    span?: {
        startLine: number;
        endLine: number;
    };
}
export interface GraphQuery {
    name?: string;
    pattern?: string;
    kind?: GraphNode["kind"];
    limit?: number;
}
export interface GraphExpansion {
    nodes: GraphNode[];
    edges: GraphEdgeRecord[];
}
export interface GraphHandle {
    find(query: GraphQuery): GraphNode[];
    expand(id: string, options?: {
        kinds?: GraphEdgeRecord["kind"][];
        depth?: number;
    }): GraphExpansion;
    snapshot(): {
        indexRevision: string;
        nodes: GraphNode[];
        edges: GraphEdgeRecord[];
    };
}
