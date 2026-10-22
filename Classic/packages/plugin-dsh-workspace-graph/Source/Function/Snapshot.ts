// Snapshot - the loadAll read: rebuild the full node and edge lists from the
// open domain's stored records when the handle exists, else from the
// in-memory mirror. Every record is re-validated (IsRecord); a record that
// fails validation is skipped and counted (State.Invalid), never guessed.
// The __meta record is never mistaken for a file record.
import type Snapshot from "@Interface/Snapshot.js";
import type State from "@Interface/State.js";

import IsRecord from "./IsRecord.js";
import Store from "./Store.js";

export default (StateRef: State): Snapshot => {
	const Pairs: [string, unknown][] =
		StateRef.Domain === undefined
			? Array.from(StateRef.Records, ([Key, Value]) => [Key, Value] as [string, unknown])
			: Store.entries(StateRef);
	const Nodes: Snapshot["nodes"] = [];
	const Edges: Snapshot["edges"] = [];
	for (const [Key, Value] of Pairs) {
		if (Key === "__meta") {
			continue;
		}
		if (!IsRecord(Value)) {
			StateRef.Invalid += 1;
			continue;
		}
		Nodes.push(...Value.nodes);
		Edges.push(...Value.edges);
	}
	return { indexRevision: String(StateRef.Revision), nodes: Nodes, edges: Edges };
};
