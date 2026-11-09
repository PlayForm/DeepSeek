/**
 * @module Graph
 *
 * The self-contained structural mirror of the workspaceGraph service
 * surface: the read half of the W1 frozen contract.
 *
 * @remarks
 * WAVE-1-BRIEF.md section 4.3 freezes the contract. The shapes are the
 * node, edge and query shapes the resolution rules consume. The operate hook
 * never imports the graph package; this declaration keeps the consumer
 * honest and compiles without the sibling.
 *
 *   - GraphNode - the W1 Node (id, kind, path, name, span, fingerprint,
 *     version);
 *   - GraphEdgeRecord - the W1 Edge (kind, from, to, span);
 *   - GraphHandle - the structural service slice (find, expand, snapshot)
 *     the rules probe once (Function/Graph).
 */
export interface GraphNode {
    /**
     * The node's id.
     */
    id: string;
    /**
     * The node's kind.
     */
    kind: "File" | "Symbol" | "Block" | "Test" | "DocSection";
    /**
     * The node's repo-relative path.
     */
    path: string;
    /**
     * The symbol's name (symbols only).
     */
    name?: string;
    /**
     * The source language.
     */
    language?: "typescript" | "javascript" | "markdown";
    /**
     * The node's line span.
     */
    span?: {
        startLine: number;
        endLine: number;
    };
    /**
     * The node's content fingerprint.
     */
    fingerprint: string;
    /**
     * The node's version stamp.
     */
    version: string;
}
export interface GraphEdgeRecord {
    /**
     * The edge's kind.
     */
    kind: "contains" | "imports";
    /**
     * The source node's id.
     */
    from: string;
    /**
     * The target node's id.
     */
    to: string;
    /**
     * The edge's line span, when the edge carries one.
     */
    span?: {
        startLine: number;
        endLine: number;
    };
}
export interface GraphQuery {
    /**
     * The exact name to find.
     */
    name?: string;
    /**
     * The case-insensitive substring to find.
     */
    pattern?: string;
    /**
     * The node kind to filter by.
     */
    kind?: GraphNode["kind"];
    /**
     * The maximum number of results.
     */
    limit?: number;
}
export interface GraphExpansion {
    /**
     * The connected nodes.
     */
    nodes: GraphNode[];
    /**
     * The connecting edges.
     */
    edges: GraphEdgeRecord[];
}
export interface GraphHandle {
    /**
     * Find nodes by query.
     */
    find(query: GraphQuery): GraphNode[];
    /**
     * Expand one node's neighborhood.
     */
    expand(id: string, options?: {
        kinds?: GraphEdgeRecord["kind"][];
        depth?: number;
    }): GraphExpansion;
    /**
     * Snapshot the whole index.
     */
    snapshot(): {
        indexRevision: string;
        nodes: GraphNode[];
        edges: GraphEdgeRecord[];
    };
}
