// Projection - the in-memory shape of the P2 GRAPH PROJECTION (the re-spec:
// the plan's generated repo index is superseded by the workspace graph,
// Documentation/Plans/Completion-Spec/00-OVERVIEW.md section 6,
// Documentation/Plans/Completion-Spec/03-SUGGESTERS.md section 3).
//
// One projection is built from ONE `ctx.workspaceGraph.snapshot()` read and
// answers three questions per pack candidate, all deterministic and all
// graph-derived (no clock, no LLM, no I/O after the snapshot):
//
//   * does a node exist at the candidate path (or under the candidate glob);
//   * which node kind is there (File / Symbol / Block / Test / DocSection);
//   * how deep and how recent the node is (depth below the snapshot's common
//     root; recency = the node's version-token rank inside the snapshot).
//
// The facts map is keyed by the NORMALIZED node path (forward slashes, no
// duplicate separators). A path carries every kind the graph recorded for it
// (a File node, its Symbol nodes and its Block nodes share the path), so the
// intent's expected-kind check reads one entry.
export interface Fact {
	/** The node kinds recorded at the path, in the graph's own order. */
	kinds: string[];
	/** The path's depth below the snapshot's common root (1 = a root file). */
	depth: number;
	/** The version-token rank in [0, 1] (1 = the newest token in the snapshot). */
	recency: number;
}

export default interface Projection {
	/** The graph's indexRevision the projection was built from. */
	revision: string;
	/** The number of nodes read from the snapshot. */
	nodes: number;
	/** The common-root segment count the depth is measured below. */
	root: number;
	/** The normalized node path to its facts. */
	facts: Map<string, Fact>;
}
