import type State from "../Interface/State.js";
import type Task from "../Interface/Task.js";
import type { TaskState } from "../Interface/Task.js";
export default _default;
/**
 * @module Settle
 *
 * The task completion / failure / interruption step (the state machine's
 * terminal arms): flip the state, release the agent's seat, record the
 * result hash on completion, write the journal record + the ledger line.
 *
 * @remarks
 *
 * This is the slot-frees event that the
 * auto-dispatch regime reacts to (the settled IDLE children release their
 * active slots; the dispatcher fills them).
 */
declare function _default(State: State, Id: string, Next: Exclude<TaskState, "queued" | "dispatched">, ResultHash?: string, Append?: (Message: string) => void): Task | undefined;
