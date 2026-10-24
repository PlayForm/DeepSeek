// Node - the slice of one graph node a reflective operation reads
// (Interface/Node): the workspace graph's `workspaceGraph.getNode(id)` answer.
// The reflective Replace targets a node by its FROZEN id and verifies the
// node's span with the content-derived fingerprint before rewriting it, so the
// slice carries exactly what that needs: the id, the kind, the path, the name
// (the fingerprint's name component), the 1-based inclusive span, and the
// fingerprint the graph computed at index time.
export default interface Node {
	/** The frozen node id (`Symbol:<path>:<name>`, `Block:<path>:<line>:<kind>`). */
	id: string;
	/** The node kind (Symbol, Block, ...). */
	kind: string;
	/** The resolved display path of the file the node lives in. */
	path: string;
	/** The node's name (a Symbol's declaration name); absent for a Block. */
	name?: string;
	/** The 1-based, inclusive line span. */
	span?: { startLine: number; endLine: number };
	/** The graph's content-derived fingerprint at index time. */
	fingerprint?: string;
}
