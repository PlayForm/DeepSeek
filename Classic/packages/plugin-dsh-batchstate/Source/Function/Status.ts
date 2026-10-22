// Status - the write API's setStatus (Function/Status): the state
// transition (idle -> active -> completed -> failed -> interrupted; the
// queue movements). A terminal status (completed/failed/interrupted)
// stamps finishedAt once, drops the member from the queue (the members
// behind shift up), and appends the completion to the bounded ring (the
// oldest drop is implicit - the ring is compact by contract, plan section
// 3 item 5). A reactivation to active clears finishedAt. The transition
// is ledgered and emitted AFTER the state is updated.
import Emit from "@Function/Emit.js";
import Ensure from "@Function/Ensure.js";
import type Shape from "@Interface/Member.js";
import type State from "@Interface/State.js";

export default (State: State, Agent: string, Status: string): void => {
	const Member = Ensure(State, Agent);
	switch (true) {
		case Status === "active":
			Member.status = "active";
			Member.finishedAt = 0;
			break;
		default:
			Member.status = Status as Shape["status"];
			Member.finishedAt = Date.now();
			// The queue movement: drop the member, shift the rest up.
			const At = State.IdleQueue.indexOf(Agent);
			switch (true) {
				case At >= 0:
					State.IdleQueue.splice(At, 1);
					break;
				default:
			}
			// The completions ring (bounded by maxRecent).
			State.Recent.unshift({
				id: Agent,
				status: Member.status,
				task: Member.task,
				at: Member.finishedAt,
			});
			while (State.Recent.length > State.MaxRecent) {
				State.Recent.pop();
			}
	}
	State.Factory.Append(State, `status ${Agent}: ${Status}`);
	Emit(State, { batch: State.Batch, id: Agent, kind: "status" });
};
