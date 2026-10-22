// Graph - the SELF-CONTAINED declaration of the sibling workspace-graph
// service's shape (the W1 contract, WAVE-1-BRIEF.md section 4.3). The
// end-phase wires the real import; until then the context service consumes
// the graph through this structural handle only (the injected
// `workspaceGraph` accessor is probed at packet time - an absent sibling is
// an honest OPEN line, never a crash). Kept minimal: only the fields and
// methods the packet builder reads.
interface Span {
	startLine: number;
	endLine: number;
}

interface GraphNode {
	id: string;
	kind: "File" | "Symbol" | "Block" | "Test" | "DocSection";
	path: string;
	name?: string;
	span?: Span;
	fingerprint: string;
	version: string;
}

interface GraphEdge {
	kind: "contains" | "imports" | "references" | "calls" | "tests";
	from: string;
	to: string;
	span?: Span;
}

interface GraphSnapshot {
	indexRevision: string;
	nodes: GraphNode[];
	edges: GraphEdge[];
}

export default interface GraphHandle {
	snapshot(): GraphSnapshot;
	getNode(id: string): GraphNode | undefined;
	find(query: { name?: string; kind?: GraphNode["kind"]; limit?: number }): GraphNode[];
	expand(
		id: string,
		options?: { kinds?: GraphEdge["kind"][]; depth?: number },
	): { nodes: GraphNode[]; edges: GraphEdge[] };
	statistics(): { files: number; nodes: number; edges: number; indexRevision: string };
}

export type { GraphEdge, GraphNode, GraphSnapshot, Span };
