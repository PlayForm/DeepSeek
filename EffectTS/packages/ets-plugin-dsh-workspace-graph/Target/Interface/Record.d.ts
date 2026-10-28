import type Edge from "@Interface/Edge.js";
import type Node from "@Interface/Node.js";
export default interface Record {
    version: string;
    fingerprint: string;
    nodes: Node[];
    edges: Edge[];
}
