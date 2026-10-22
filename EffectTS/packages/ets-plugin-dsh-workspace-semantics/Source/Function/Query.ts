// Query - the read-only projections (Function/Query): the reference list of
// one path's model and the service's statistics triple. No I/O, no building,
// no throwing: an unknown path answers honestly with an empty list.
import type ReferenceNode from "@Interface/ReferenceNode.js";
import type State from "@Interface/State.js";

export default {
	/** The reference list of the path's model (empty when unresolved). */
	References(State: State, Path: string): ReferenceNode[] {
		return State.Index.get(Path)?.references ?? [];
	},
	/** The statistics triple: index size, revision, adapter count. */
	Statistics(State: State): {
		paths: number;
		revision: number;
		adapters: number;
	} {
		return {
			paths: State.Index.size,
			revision: State.Revision,
			adapters: State.Adapters.size,
		};
	},
};
