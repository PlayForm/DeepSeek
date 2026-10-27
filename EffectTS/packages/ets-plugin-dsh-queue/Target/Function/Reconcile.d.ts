import type State from "@Interface/State.js";
import type Task from "@Interface/Task.js";
/** The reconcile report (the caller's audit of what moved). */
export interface Report {
    requeued: string[];
    failed: string[];
}
export default _default;
declare function _default(State: State, Persisted: readonly Task[] | undefined, Append: (Message: string) => void): Report;
