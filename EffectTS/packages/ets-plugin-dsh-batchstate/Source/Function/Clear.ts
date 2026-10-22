// Clear - the whole-batch reset (Function/Clear): drop every member, the
// queue and the completions ring. The reset is ledgered and emitted with an
// empty member id (the whole-batch change).
import Emit from "@Function/Emit.js";
import type State from "@Interface/State.js";

export default (State: State): void => {
	State.Members.clear();
	State.IdleQueue.length = 0;
	State.Recent.length = 0;
	State.Factory.Append(State, "cleared");
	Emit(State, { batch: State.Batch, id: "", kind: "clear" });
};
