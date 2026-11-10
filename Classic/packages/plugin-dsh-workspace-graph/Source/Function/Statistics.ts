import type State from "@Interface/State.js";
import type Statistics from "@Interface/Statistics.js";

/**
 * @module Statistics
 *
 * The counts over the valid in-memory mirror.
 *
 * @remarks
 *
 * The body reports the stored file count, the total node and edge counts, and the current
 * `indexRevision`.
 */
export default (StateRef: State): Statistics => {
	let Nodes = 0;
	let Edges = 0;
	for (const Record of StateRef.Records.values()) {
		Nodes += Record.nodes.length;
		Edges += Record.edges.length;
	}
	return {
		files: StateRef.Records.size,
		nodes: Nodes,
		edges: Edges,
		indexRevision: String(StateRef.Revision),
	};
};
