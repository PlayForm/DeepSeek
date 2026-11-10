import type Edge from "./Edge.js";
import type Node from "./Node.js";
/**
 * @module Snapshot
 *
 * The full graph read, per the brief's section 4.3 GraphSnapshot.
 *
 * @remarks
 *
 * Every valid stored record's nodes and edges plus the indexRevision the
 * graph was built from. A record that fails validation is skipped and
 * counted, never guessed.
 */
export default interface Snapshot {
    /**
     * The index revision the graph was built from, as a string.
     */
    indexRevision: string;
    /**
     * Every valid record's nodes.
     */
    nodes: Node[];
    /**
     * Every valid record's edges.
     */
    edges: Edge[];
}
