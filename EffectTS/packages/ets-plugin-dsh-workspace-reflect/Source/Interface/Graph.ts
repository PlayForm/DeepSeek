// GraphHandle - the SELF-DECLARED sibling service shape (Interface/Graph):
// the slice of `ctx.workspaceGraph` the reflect service consumes (the
// WAVE-1-BRIEF frozen contract, section 4.3). Declared here, not imported,
// because the PoC is self-contained: the sibling package may not exist yet,
// and the end-phase wires the real import. The handle is probed at use time
// (never injected): an absent graph is an honest skip - the operation still
// completes, only the reflective carry (the re-index) does not run, and a
// node-targeted Replace falls back to its explicit span.
import type Node from "@Interface/Node.js";

export default interface GraphHandle {
	/** The frozen contract's method: re-index one file after a
	 *  transformation, so the graph's representation stays current. */
	indexFile(path: string): Promise<unknown>;
	/** The frozen contract's method: find nodes by name (the reflective
	 *  locate aid for a rename given without a span). */
	find(query: { name?: string; pattern?: string; kind?: string; limit?: number }): unknown[];
	/** The frozen contract's method: one node by id - the AST source a
	 *  fingerprint-targeted Replace resolves its span from. */
	getNode(id: string): Node | undefined;
}
