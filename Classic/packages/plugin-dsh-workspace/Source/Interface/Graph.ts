// Graph - the STRUCTURAL VIEW of the Wave-1 graph service
// (ctx.workspaceGraph, @playform/plugin-dsh-workspace-graph), declared
// HERE from the W1 frozen contract (WAVE-1-BRIEF.md section 4.3) because
// the PoC is self-contained: the sibling package is not imported - the
// end-phase wires the real import (POC-BRIEF section 2, rule 5). The types
// are the contract VERBATIM (the node kinds, the edge kinds, the span and
// fingerprint rules); only the W2+ kinds the W1 service does not expose
// (ConfigKey nodes, references/calls/tests edges) are absent, exactly as
// the contract says they must not be faked.
//
// The service is a `Service` subclass registered under the exact name
// `workspaceGraph`; Interface/Context.ts publishes the typed accessor.

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
	removeFile(path: string): Promise<boolean>;
	getNode(id: string): Node | undefined;
	find(query: FindQuery): Node[];
	expand(id: string, options?: { kinds?: EdgeKind[]; depth?: number }): Expansion;
	snapshot(): GraphSnapshot;
	statistics(): GraphStatistics;
}
