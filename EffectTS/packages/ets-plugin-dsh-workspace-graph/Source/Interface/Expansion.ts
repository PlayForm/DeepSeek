// Expansion - the expand() result (the brief's section 4.3 Expansion): the
// start node first, then every reached node in visit order, plus the
// traversed edges. Each reachable node is visited once (the cycle guard).
import type Edge from "@Interface/Edge.js";
import type Node from "@Interface/Node.js";

export default interface Expansion {
	nodes: Node[];
	edges: Edge[];
}
