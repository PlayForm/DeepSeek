import type State from "../Interface/State.js";
import type Task from "../Interface/Task.js";
export default _default;
/**
 * @module Schedule
 *
 * The dispatcher's deterministic order (SUBAGENT-QUEUE-PLUGIN.md
 * section 2.2, the pair-schedule replacement): from the queued tasks, pick
 * the NEXT one to dispatch. Pure and deterministic - the same store always
 * produces the same order:
 *
 *   1. Only tasks whose dependencies are all COMPLETED are eligible (a
 *      dependency in any other state blocks the task - it is never skipped
 *      over silently, the order simply waits).
 *   2. Priority descending (higher first).
 *   3. FIFO by enqueue sequence (the Map's insertion order; the seq field
 *      makes it explicit).
 *
 * @remarks
 *
 * Returns undefined when nothing is eligible (an empty queue, a saturated
 * dependency, or no capacity).
 */
declare function _default(State: State, Agent: string): Task | undefined;
