import type Edge from "./Edge.js";
import type Node from "./Node.js";
export default interface Record {
    version: string;
    fingerprint: string;
    nodes: Node[];
    edges: Edge[];
}
