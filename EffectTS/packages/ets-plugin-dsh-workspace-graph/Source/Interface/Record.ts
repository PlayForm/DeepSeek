// Record - one stored file record (the brief's section 4.4 KV value shape):
// one record per path, keyed by the path. `version` is the file version
// token at index time, `fingerprint` the file node's fingerprint, and the
// nodes/edges are exactly what the parse produced. The meta record keyed
// `__meta` carries `{ indexRevision }` and is NOT a Record.
import type Edge from "@Interface/Edge.js";
import type Node from "@Interface/Node.js";

export default interface Record {
	version: string;
	fingerprint: string;
	nodes: Node[];
	edges: Edge[];
}
