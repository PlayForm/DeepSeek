import type Edge from "@Interface/Edge.js";
import type Node from "@Interface/Node.js";
export default interface Expansion {
    nodes: Node[];
    edges: Edge[];
}
