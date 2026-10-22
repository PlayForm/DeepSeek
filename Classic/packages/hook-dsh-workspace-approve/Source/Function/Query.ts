// Query - the read surface of the hook's state (Function/Query): one binding
// by id, the ring newest-first, and the statistics triple. Pure in-memory
// reads over State; never touches storage or the filesystem.
import type Binding from "@Interface/Binding.js";
import type State from "@Interface/State.js";

/** One binding by id, or undefined. */
export const ById = (State: State, Id: string): Binding | undefined => State.ById.get(Id);

/** The ring, NEWEST first; an optional limit slices the head. */
export const Ring = (State: State, Limit: number | undefined): Binding[] => {
	const Newest = [...State.Ring].reverse();
	switch (true) {
		case typeof Limit === "number" && Number.isFinite(Limit) && Limit >= 0:
			return Newest.slice(0, Limit);
		default:
			return Newest;
	}
};

/** The statistics triple: distinct bindings, ring depth, the current
 *  sequence. */
export const Statistics = (
	State: State,
): {
	bindings: number;
	byId: number;
	sequence: number;
} => ({
	bindings: State.Ring.length,
	byId: State.ById.size,
	sequence: State.Sequence,
});
