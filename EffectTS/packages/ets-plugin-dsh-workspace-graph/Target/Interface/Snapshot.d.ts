import type Edge from "@Interface/Edge.js";
import type Node from "@Interface/Node.js";
export default interface Snapshot {
    indexRevision: string;
    nodes: Node[];
    edges: Edge[];
}
