// Task - the write API's setTask (Function/Task): update the member's
// CURRENT ACTIVITY (the LIVE task - the agents report their phase changes;
// the parent sets the task at the activation), ledger the line, then emit
// the batch/state-change event (the plan's refresh trigger: the consumers
// re-splice the compiled block). The FIRST active transition stamps
// startedAt once - a later setTask never resets it. A member that was
// completed/failed/interrupted and reports a task is REACTIVATED (status
// active, finishedAt cleared - the redo case).
import Emit from "@Function/Emit.js";
import Ensure from "@Function/Ensure.js";
import type State from "@Interface/State.js";

export default (State: State, Agent: string, Task: string): void => {
	const Member = Ensure(State, Agent);
	Member.task = Task;
	switch (true) {
		case Member.startedAt === 0:
			Member.startedAt = Date.now();
			break;
		default:
	}
	switch (true) {
		case Member.status !== "active":
			Member.status = "active";
			Member.finishedAt = 0;
			break;
		default:
	}
	State.Factory.Append(State, `task ${Agent}: ${Task}`);
	Emit(State, { batch: State.Batch, id: Agent, kind: "task" });
};
