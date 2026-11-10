import type Edge from "./Edge.js";
import type Node from "./Node.js";
/**
 * @module Expansion
 *
 * The expand() result, per the brief's section 4.3 Expansion.
 *
 * @remarks
 *
 * The start node first, then every reached node in visit order, plus the
 * traversed edges. Each reachable node is visited once (the cycle guard).
 */
export default interface Expansion {
    /**
     * The start node first, then every reached node in visit order.
     */
    nodes: Node[];
    /**
     * The traversed edges.
     */
    edges: Edge[];
}
