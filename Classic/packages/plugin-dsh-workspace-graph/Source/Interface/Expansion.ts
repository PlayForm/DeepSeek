import type Edge from "@Interface/Edge.js";
import type Node from "@Interface/Node.js";

/**
 * @module Expansion
 *
 * The expand() result (the brief's section 4.3 Expansion).
 *
 * @remarks
 *
 * The result carries the start node first, then every reached node in visit order, plus the
 * traversed edges. Each reachable node is visited once (the cycle guard).
 */
export default interface Expansion {
	/**
	 * The start node first, then every reached node in visit order.
	 */
	nodes: Node[];

	/**
	 * The edges traversed by the walk.
	 */
	edges: Edge[];
}
