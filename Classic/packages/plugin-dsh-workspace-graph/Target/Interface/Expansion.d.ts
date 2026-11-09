import type Edge from "./Edge.js";
import type Node from "./Node.js";
export default interface Expansion {
    nodes: Node[];
    edges: Edge[];
}
