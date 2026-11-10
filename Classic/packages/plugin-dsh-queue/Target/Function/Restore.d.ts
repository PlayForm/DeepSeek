import type State from "../Interface/State.js";
import type Task from "../Interface/Task.js";
export default _default;
/**
 * @module Restore
 *
 * Rebuild the queue store from a PERSISTED queue record (the restart's
 * first half): the caller hands back the previous process's
 * `Snapshot().tasks`, and this module reinstates the tasks, the id sequence
 * and the seat bookkeeping.
 *
 * @remarks
 *
 * The restore is deliberately exact: the persisted state is the truth the
 * reconcile then compares with the live agents. The id sequence is raised to
 * the highest restored `seq`, so a new enqueue can never collide with a
 * restored id; the seats are re-taken for every ACTIVE task (a restored
 * `dispatched`/`running` task still occupies its pool slot until the
 * reconcile proves its child gone), under the seat key the task was assigned
 * to.
 */
declare function _default(State: State, Persisted: readonly Task[]): void;
