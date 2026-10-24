// Surfaces - the write API's setScope (Function/Surfaces): the scope
// registry update - the surfaces (paths) the member owns. The list is
// copied (the caller's array is never aliased), the update is ledgered and
// emitted after the state is updated.
import Emit from "@Function/Emit.js";
import Ensure from "@Function/Ensure.js";
import Persist from "@Function/Persist.js";
import type State from "@Interface/State.js";

export default (State: State, Agent: string, Surfaces: string[]): void => {
	const Member = Ensure(State, Agent);
	Member.scope = [...Surfaces];
	State.Factory.Append(State, `scope ${Agent}: ${Surfaces.length} surfaces`);
	Persist(State);
	Emit(State, { batch: State.Batch, id: Agent, kind: "scope" });
};
