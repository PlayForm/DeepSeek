// Settle - the task completion / failure / interruption step (the state
// machine's terminal arms): flip the state, release the agent's seat
// (Function/Capacity), record the result hash on completion, write the
// journal record + the ledger line. This is the slot-frees event that the
// auto-dispatch regime reacts to (the settled IDLE children release their
// active slots; the dispatcher fills them).
import { Release } from "@Function/Capacity.js";
import type State from "@Interface/State.js";
import type Task from "@Interface/Task.js";
import type { TaskState } from "@Interface/Task.js";

export default (
	State: State,
	Id: string,
	Next: Exclude<TaskState, "queued" | "dispatched">,
	ResultHash?: string,
	Append?: (Message: string) => void,
): Task | undefined => {
	const Task_ = State.Tasks.get(Id);
	if (Task_ === undefined) {
		return undefined;
	}
	// Only an active task settles (a queued/dispatched task is not running).
	if (Task_.state !== "dispatched" && Task_.state !== "running") {
		return undefined;
	}
	const Agent = Task_.assignedAgent ?? "main";
	Task_.state = Next;
	if (Next === "completed") {
		Task_.resultHash = ResultHash;
	}
	Release(State, Agent);
	State.Factory?.Journal(State, `task ${Next}`, Id, Agent);
	// Byte-stable template: `<state> <id> (<agent>)`.
	Append?.(`${Next} ${Id} (${Agent})`);
	return Task_;
};
