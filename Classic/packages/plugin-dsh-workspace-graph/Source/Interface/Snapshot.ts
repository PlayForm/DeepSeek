/**
 * @module Snapshot
 *
 * The full graph read (the brief's section 4.3 GraphSnapshot): every valid stored record's
 * nodes and edges plus the indexRevision the graph was built from.
 *
 * @remarks
 * A record that fails validation is skipped and counted, never guessed.
 */
import type Edge from "@Interface/Edge.js";
import type Node from "@Interface/Node.js";

export default interface Snapshot {
	/** The revision the graph was built from, as a string. */
	indexRevision: string;
	/** Every valid stored record's nodes. */
	nodes: Node[];
	/** Every valid stored record's edges. */
	edges: Edge[];
}
