import type State from "../Interface/State.js";
export default _default;
/**
 * @module Task
 *
 * The write API's setTask: it updates the member's CURRENT ACTIVITY.
 *
 * @remarks
 *
 * The task is the LIVE task - the agents report their phase changes; the parent sets the task at
 * the activation. The update is ledgered, then the batch/state-change event is emitted (the plan's
 * refresh trigger: the consumers re-splice the compiled block). The FIRST active transition stamps
 * startedAt once - a later setTask never resets it. A member that was completed/failed/interrupted
 * and reports a task is REACTIVATED (status active, finishedAt cleared - the redo case).
 */
declare function _default(State: State, Agent: string, Task: string): void;
