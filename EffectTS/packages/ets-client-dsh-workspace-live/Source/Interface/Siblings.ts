// Siblings - the self-contained PoC declarations of the sibling workspace
// services the live view consumes (Documentation/Plans/Workspace-Family/
// WAVE-1-BRIEF.md sections 4-5, the frozen W1 contract). No runtime import
// of a sibling package exists yet; the end-phase wires the real imports
// and these declarations become the type-only mirrors.
//
// The graph (plugin-dsh-workspace-graph) and the observe
// (hook-dsh-workspace-observe) services are the W1 foundation; the live
// view consumes the graph snapshot and the observe stamps, plus the
// workspace events the later waves surface.
export type NodeKind = "File" | "Symbol" | "Block" | "Test" | "DocSection";

export type Span = { startLine: number; endLine: number };

export type GraphNode = {
	id: string;
	kind: NodeKind;
	path: string;
	name?: string;
	fingerprint: string;
	version: string;
};

export type GraphSnapshot = {
	indexRevision: string;
	nodes: GraphNode[];
};

// The observe stamp (W1 section 5.3): the path, the version, the origin,
// the monotonic sequence (never a wall clock).
export type Stamp = {
	path: string;
	version: string;
	origin: "fs/observed" | "manual";
	sequence: number;
};

// The workspace event (the distribution law's recursion prevention: every
// event carries the operation identifier, the parent identifier, the event
// category). The live view presents at the END of the invisible flow; an
// event is what surfaces a change.
export type WorkspaceEvent = {
	operationId: string;
	parentId: string;
	category: string;
	path?: string;
	sequence: number;
};
