// Graph - the DECLARED SHAPE of the sibling workspace graph service
// (hook-dsh-workspace-observe / plugin-dsh-workspace-graph, the W1
// foundation per Documentation/Plans/Workspace-Family/WAVE-1-BRIEF.md and
// SEARCH-SUGGESTER-PLUGIN.md §9.2).
//
// SELF-CONTAINED POC: this package declares the sibling service's shape in
// its own Interface and does NOT import from sibling workspace packages
// that may not exist yet. The end-phase wires the real import (or, if the
// real service's surface differs, adapts this declaration to it - the
// declaration is the contract this package holds the service to, not a
// copy of the sibling's source).
//
// The contract the graph-suggester consumes:
//   * `neighborhood(path)` - for a repo-relative source file path, returns
//     the connected component around its code blocks: the definition file,
//     the callers, the tests, the doc block. Ordered by relevance. Bounded
//     by `limit` (default 7, matching maxCandidates).
//   * The graph is a READ service: the suggester never mutates it, never
//     indexes on its behalf, and treats every throw as "no graph" (the
//     abstention path, not an error for the user).
//
// The augmentation publishes the typed vocabulary on the cordis Context
// (plugin-development skill, item 12), so `ctx.workspaceGraph` is fully
// typed at every consumption site. The injected service name is
// `workspaceGraph` (Library.ts inject list).
export interface GraphEntry {
	/** The repo-relative path of the neighborhood entry. */
	path: string;
	/** The role of the entry in the component: "definition" | "caller" | "test" | "doc" | a graph-specific role. */
	role: string;
	/** The one phrase the model reads (e.g. "the callers"). */
	reason: string;
}

export default interface WorkspaceGraph {
	/**
	 * The connected component around a file's code blocks.
	 * @param Path - the repo-relative path of the anchor file.
	 * @param Limit - the maximum entries (default 7).
	 */
	neighborhood(Path: string, Limit?: number): GraphEntry[];
}

declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The workspace graph service (W1 foundation; declared in this package). */
		workspaceGraph: WorkspaceGraph;
	}
}
