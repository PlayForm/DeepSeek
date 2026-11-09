/**
 * @module Siblings
 *
 * The self-contained PoC declarations of the sibling workspace services the
 * live view consumes.
 *
 * @remarks
 * Documentation/Plans/Workspace-Family/WAVE-1-BRIEF.md sections 4-5, the
 * frozen W1 contract. No runtime import of a sibling package exists yet; the
 * end-phase wires the real imports and these declarations become the
 * type-only mirrors.
 *
 * The graph (plugin-dsh-workspace-graph) and the observe
 * (hook-dsh-workspace-observe) services are the W1 foundation; the live
 * view consumes the graph snapshot and the observe stamps, plus the
 * workspace events the later waves surface.
 */
export type NodeKind = "File" | "Symbol" | "Block" | "Test" | "DocSection";

/**
 * One node's line span.
 */
export type Span = { startLine: number; endLine: number };

/**
 * One graph node in a snapshot.
 */
export type GraphNode = {
	/**
	 * The node's id.
	 */
	id: string;
	/**
	 * The node's kind.
	 */
	kind: NodeKind;
	/**
	 * The node's path.
	 */
	path: string;
	/**
	 * The node's display name, when it carries one.
	 */
	name?: string;
	/**
	 * The node's content fingerprint.
	 */
	fingerprint: string;
	/**
	 * The node's version.
	 */
	version: string;
};

/**
 * One graph snapshot: the index revision and the nodes.
 */
export type GraphSnapshot = {
	/**
	 * The index revision.
	 */
	indexRevision: string;
	/**
	 * The snapshot's nodes.
	 */
	nodes: GraphNode[];
};

/**
 * The observe stamp (W1 section 5.3): the path, the version, the origin,
 * the monotonic sequence (never a wall clock).
 */
export type Stamp = {
	/**
	 * The observed path.
	 */
	path: string;
	/**
	 * The observed version.
	 */
	version: string;
	/**
	 * The stamp's origin.
	 */
	origin: "fs/observed" | "manual";
	/**
	 * The monotonic sequence (never a wall clock).
	 */
	sequence: number;
};

/**
 * The workspace event (the distribution law's recursion prevention: every
 * event carries the operation identifier, the parent identifier, the event
 * category). The live view presents at the END of the invisible flow; an
 * event is what surfaces a change.
 */
export type WorkspaceEvent = {
	/**
	 * The operation identifier.
	 */
	operationId: string;
	/**
	 * The parent identifier.
	 */
	parentId: string;
	/**
	 * The event category.
	 */
	category: string;
	/**
	 * The affected path, when the event carries one.
	 */
	path?: string;
	/**
	 * The event's sequence.
	 */
	sequence: number;
};
