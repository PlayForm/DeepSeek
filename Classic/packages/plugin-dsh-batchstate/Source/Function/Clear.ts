import Emit from "@Function/Emit.js";
import Persist from "@Function/Persist.js";
import type State from "@Interface/State.js";

/**
 * @module Clear
 *
 * The whole-batch reset: it drops every member, the queue and the completions ring.
 *
 * @remarks
 *
 * The reset is ledgered and emitted with an empty member id (the whole-batch change).
 */
export default (State: State): void => {
	State.Members.clear();
	State.IdleQueue.length = 0;
	State.Recent.length = 0;
	State.Proposals.clear();
	State.Gates.clear();
	State.Seen.length = 0;
	// The reset empties every persisted table.
	State.Dirty.add("members");
	State.Dirty.add("queue");
	State.Dirty.add("proposals");
	State.Dirty.add("gates");
	State.Factory.Append(State, "cleared");
	Persist(State);
	Emit(State, { batch: State.Batch, id: "", kind: "clear" });
};
