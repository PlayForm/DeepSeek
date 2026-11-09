/**
 * @module Task
 *
 * The write API's setTask: it updates the member's CURRENT ACTIVITY.
 *
 * @remarks
 * The task is the LIVE task - the agents report their phase changes; the parent sets the task at
 * the activation. The update is ledgered, then the batch/state-change event is emitted (the plan's
 * refresh trigger: the consumers re-splice the compiled block). The FIRST active transition stamps
 * startedAt once - a later setTask never resets it. A member that was completed/failed/interrupted
 * and reports a task is REACTIVATED (status active, finishedAt cleared - the redo case).
 */
import Emit from "@Function/Emit.js";
import Ensure from "@Function/Ensure.js";
import Persist from "@Function/Persist.js";
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
	Persist(State);
	Emit(State, { batch: State.Batch, id: Agent, kind: "task" });
};
