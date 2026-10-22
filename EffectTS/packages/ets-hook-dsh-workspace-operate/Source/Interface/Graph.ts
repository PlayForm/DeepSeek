// Graph - the SELF-CONTAINED structural mirror of the workspaceGraph
// service surface (Interface/Graph), the W1 frozen contract's read half
// (WAVE-1-BRIEF.md section 4.3): the node, edge and query shapes the
// resolution rules consume. The operate hook never imports the graph
// package; this declaration keeps the consumer honest and compiles without
// the sibling.
//
//   GraphNode        - the W1 Node (id, kind, path, name, span, fingerprint,
//                      version);
//   GraphEdgeRecord  - the W1 Edge (kind, from, to, span);
//   GraphHandle      - the structural service slice (find, expand, snapshot)
//                      the rules probe once (Function/Graph).
export interface GraphNode {
	id: string;
	kind: "File" | "Symbol" | "Block" | "Test" | "DocSection";
	path: string;
	name?: string;
	language?: "typescript" | "javascript" | "markdown";
	span?: { startLine: number; endLine: number };
	fingerprint: string;
	version: string;
}

export interface GraphEdgeRecord {
	kind: "contains" | "imports";
	from: string;
	to: string;
	span?: { startLine: number; endLine: number };
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
	expand(
		id: string,
		options?: { kinds?: GraphEdgeRecord["kind"][]; depth?: number },
	): GraphExpansion;
	snapshot(): { indexRevision: string; nodes: GraphNode[]; edges: GraphEdgeRecord[] };
}
