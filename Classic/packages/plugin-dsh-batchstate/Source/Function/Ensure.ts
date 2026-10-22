// Ensure - the member upsert (Function/Ensure): get-or-create the member
// record for one agent id. A new member starts idle, unqueued, with an
// empty scope and a role of "unknown" (the caller may set the role later
// through setTask's contract - the parent sets the full record at the
// activation). The creation is NOT ledgered - the write API's own line is
// the record.
import type Shape from "@Interface/Member.js";
import type State from "@Interface/State.js";

export default (State: State, Agent: string): Shape => {
	const Known = State.Members.get(Agent);
	switch (true) {
		case Known !== undefined:
			return Known;
	}
	const Member: Shape = {
		id: Agent,
		role: "unknown",
		task: "",
		status: "idle",
		queue: -1,
		scope: [],
		startedAt: 0,
		finishedAt: 0,
	};
	State.Members.set(Agent, Member);
	return Member;
};
