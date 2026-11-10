import type Node from "@Interface/Node.js";
import type State from "@Interface/State.js";

/**
 * @module GetNode
 *
 * The getNode body: a linear scan over the mirror's nodes by id.
 *
 * @remarks
 *
 * The first match wins, because ids are unique by construction. The scan is synchronous
 * and performs no I/O.
 */
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
