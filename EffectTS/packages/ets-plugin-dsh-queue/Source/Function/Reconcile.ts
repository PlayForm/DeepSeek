// Reconcile - the RESTART RECONCILE (SUBAGENT-QUEUE-PLUGIN.md section 3.5:
// "the queue's store survives; the in-flight dispatches resume after the
// restart - the task-states reconciled"): compare the queue state with the
// LIVE agents and settle every orphan honestly.
//
// Input: the persisted queue record from the previous process (the caller
// keeps `Snapshot().tasks`; the family has no storage domain yet, so the
// record is handed back rather than read from a store). Absent = reconcile
// the in-memory store (the same sweep, for a mid-flight check).
//
// THE ORPHAN RULE - an active task is an orphan when the agent that should
// be running it is not live:
//   - it has a `childId` and the live agent registry does not contain it, OR
//   - it has NO `childId` and it came from the persisted record (a restart:
//     the previous process's seat is stale, nothing was spawned).
// A live in-memory task without a childId is a MANUAL assignment (the
// orchestrator's own seat) and is left alone - the queue does not own it.
//
// THE ARM - requeued or failed, never silently dropped:
//   - first detection (`attempts` 0): requeue - back to `queued`, the seat
//     released, the route cleared (re-resolved at the next dispatch), and
//     `requeued <id> (<agent> gone)`;
//   - a second detection (`attempts` 1): fail honestly with the settle
//     template `failed <id> (<agent>)` - the work is not retried forever.
//
// The reconcile does not dispatch: the caller's next dispatch (or the pull
// after the settle) resumes the requeued work.
import { MAIN, Release } from "@Function/Capacity.js";
import Restore from "@Function/Restore.js";
import type { AgentsService } from "@Interface/Agent.js";
import type State from "@Interface/State.js";
import type Task from "@Interface/Task.js";

/** The reconcile report (the caller's audit of what moved). */
export interface Report {
	requeued: string[];
	failed: string[];
}

/** Whether an active task's agent is provably gone. */
const OrphanOf = (
	Task_: Task,
	Persisted: readonly Task[] | undefined,
	Live: (Id: string) => boolean,
): boolean => (Task_.childId === undefined ? Persisted !== undefined : !Live(Task_.childId));

export default (
	State: State,
	Persisted: readonly Task[] | undefined,
	Append: (Message: string) => void,
): Report => {
	if (Persisted !== undefined) {
		Restore(State, Persisted);
	}
	const Agents = State.Context?.get?.("agents") as AgentsService | undefined;
	const Live = (Id: string): boolean => Agents?.get?.(Id) !== undefined;
	const Report_: Report = { requeued: [], failed: [] };
	for (const Task_ of State.Tasks.values()) {
		if (Task_.state !== "dispatched" && Task_.state !== "running") {
			continue;
		}
		if (!OrphanOf(Task_, Persisted, Live)) {
			continue;
		}
		const Agent = Task_.assignedAgent ?? MAIN;
		Release(State, Agent);
		if (Task_.attempts < 1) {
			Task_.attempts += 1;
			Task_.state = "queued";
			Task_.childId = undefined;
			Task_.assignedAgent = undefined;
			Task_.dispatchedAt = undefined;
			Task_.route = undefined;
			Task_.agentOptions = undefined;
			State.Factory?.Journal(State, "task requeued", Task_.id, Agent);
			Append(`requeued ${Task_.id} (${Agent} gone)`);
			Report_.requeued.push(Task_.id);
			continue;
		}
		Task_.state = "failed";
		State.Factory?.Journal(State, "task failed", Task_.id, Agent);
		Append(`failed ${Task_.id} (${Agent})`);
		Report_.failed.push(Task_.id);
	}
	return Report_;
};
