import type State from "../Interface/State.js";
import type Task from "../Interface/Task.js";
/**
 * The reconcile report (the caller's audit of what moved).
 */
export interface Report {
    /**
     * The ids the reconcile moved back to `queued`.
     */
    requeued: string[];
    /**
     * The ids the reconcile marked `failed`.
     */
    failed: string[];
}
export default _default;
declare function _default(State: State, Persisted: readonly Task[] | undefined, Append: (Message: string) => void): Report;
