// Gate - the Gates-block write (Function/Gate): report one arbiter gate's
// state (BATCH-STATE-PLUGIN.md section 7.1 item 2 - the build/smokes truth
// the compiler renders). The parent (the lane that ran the gate) reports it;
// the board holds it and the compiled context carries it to every lane.
//
// The state vocabulary is closed (`green` | `red` | `unknown`): a typo in a
// gate report is a programming error, so it fails loud at the call site
// instead of painting a wrong arbiter truth. The write is ledgered,
// persisted and emitted after the state moved.
import Emit from "@Function/Emit.js";
import Persist from "@Function/Persist.js";
import type { GateState } from "@Interface/Gate.js";
import type State from "@Interface/State.js";

const STATES = ["green", "red", "unknown"] as const;

export default (State: State, Name: string, State_: string, Owner = ""): void => {
	switch (true) {
		case Name.length === 0:
			throw new Error("batchstate: gate name must be a non-empty string");
		case !STATES.includes(State_ as GateState):
			throw new Error("batchstate: gate state must be green | red | unknown");
		default:
			break;
	}
	State.Gates.set(Name, { name: Name, state: State_ as GateState, owner: Owner });
	State.Factory.Append(
		State,
		Owner.length > 0 ? `gate ${Name}: ${State_} (owner ${Owner})` : `gate ${Name}: ${State_}`,
	);
	Persist(State);
	Emit(State, { batch: State.Batch, id: Name, kind: "gate" });
};
