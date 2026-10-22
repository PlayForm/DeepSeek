// GetNode - the getNode body: a linear scan over the mirror's nodes by id
// (first match wins; ids are unique by construction). Sync, no I/O.
import type Node from "@Interface/Node.js";
import type State from "@Interface/State.js";

export default (StateRef: State, Id: string): Node | undefined => {
	for (const Record of StateRef.Records.values()) {
		for (const NodeItem of Record.nodes) {
			if (NodeItem.id === Id) {
				return NodeItem;
			}
		}
	}
	return undefined;
};
