import type Edge from "@Interface/Edge.js";
import type Node from "@Interface/Node.js";

/**
 * @module Record
 *
 * One stored file record (the brief's section 4.4 KV value shape): one record per path, keyed
 * by the path.
 *
 * @remarks
 *
 * `version` is the file version token at index time, `fingerprint` the file node's fingerprint,
 * and the nodes/edges are exactly what the parse produced. The meta record keyed `__meta`
 * carries `{ indexRevision }` and is NOT a Record.
 */
export default interface Record {
	/**
	 * The file version token at index time.
	 */
	version: string;

	/**
	 * The file node's fingerprint.
	 */
	fingerprint: string;

	/**
	 * The nodes the parse produced.
	 */
	nodes: Node[];

	/**
	 * The edges the parse produced.
	 */
	edges: Edge[];
}
