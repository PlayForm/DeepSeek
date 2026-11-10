import type State from "../Interface/State.js";
import type Task from "../Interface/Task.js";
/**
 * @module Reconcile
 *
 * The RESTART RECONCILE: compare the queue state with the LIVE agents and
 * settle every orphan honestly.
 *
 * @remarks
 *
 * SUBAGENT-QUEUE-PLUGIN.md section 3.5: "the queue's store survives; the
 * in-flight dispatches resume after the restart - the task-states
 * reconciled".
 *
 * Input: the persisted queue record from the previous process (the caller
 * keeps `Snapshot().tasks`; the family has no storage domain yet, so the
 * record is handed back rather than read from a store). Absent = reconcile
 * the in-memory store (the same sweep, for a mid-flight check).
 *
 * THE ORPHAN RULE - an active task is an orphan when the agent that should
 * be running it is not live:
 * - it has a `childId` and the live agent registry does not contain it, OR
 * - it has NO `childId` and it came from the persisted record (a restart:
 *   the previous process's seat is stale, nothing was spawned).
 * A live in-memory task without a childId is a MANUAL assignment (the
 * orchestrator's own seat) and is left alone - the queue does not own it.
 *
 * THE ARM - requeued or failed, never silently dropped:
 * - first detection (`attempts` 0): requeue - back to `queued`, the seat
 *   released, the route cleared (re-resolved at the next dispatch), and
 *   `requeued <id> (<agent> gone)`;
 * - a second detection (`attempts` 1): fail honestly with the settle template
 *   `failed <id> (<agent>)` - the work is not retried forever.
 *
 * The reconcile does not dispatch: the caller's next dispatch (or the pull
 * after the settle) resumes the requeued work.
 */
/**
 * The reconcile report (the caller's audit of what moved).
 */
export interface Report {
    requeued: string[];
    failed: string[];
}
export default _default;
declare function _default(State: State, Persisted: readonly Task[] | undefined, Append: (Message: string) => void): Report;
