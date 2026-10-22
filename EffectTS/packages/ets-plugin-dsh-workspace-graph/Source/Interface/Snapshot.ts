// Snapshot - the full graph read (the brief's section 4.3 GraphSnapshot):
// every valid stored record's nodes and edges plus the indexRevision the
// graph was built from. A record that fails validation is skipped and
// counted, never guessed.
import type Edge from "@Interface/Edge.js";
import type Node from "@Interface/Node.js";

export default interface Snapshot {
	indexRevision: string;
	nodes: Node[];
	edges: Edge[];
}
