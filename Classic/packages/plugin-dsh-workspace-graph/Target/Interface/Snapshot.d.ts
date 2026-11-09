import type Edge from "./Edge.js";
import type Node from "./Node.js";
export default interface Snapshot {
    indexRevision: string;
    nodes: Node[];
    edges: Edge[];
}
