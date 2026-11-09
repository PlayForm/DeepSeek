/**
 * @module Enqueue
 *
 * Put one task into the queue store (section 2.1): the task as data, no
 * agent context consumed.
 *
 * @remarks
 * The spec is stored verbatim (the queue
 * NEVER alters the self-contained prompts - the dispatcher only schedules).
 * The id and the enqueue sequence are assigned here (monotonic, the FIFO
 * tiebreaker), the initial state is `queued`, and one journal record +
 * one ledger line are written (the family's conventions).
 */
import type State from "../Interface/State.js";
import type Task from "../Interface/Task.js";
import type { TaskState } from "../Interface/Task.js";
/**
 * The enqueue input: everything except the id/seq/state bookkeeping. Each
 * optional field may also be explicitly undefined (the tool's parsed
 * arguments arrive that way).
 */
export interface Input {
    /**
     * The task's self-contained prompt, stored verbatim.
     */
    spec: string;
    /**
     * The task's role hint (undefined = `auto`).
     */
    role?: Task["role"];
    /**
     * The scheduling priority (higher first; default 0).
     */
    priority?: number | undefined;
    /**
     * The ids this task waits on.
     */
    dependsOn?: string[] | undefined;
}
/**
 * Map a state flip to the journal event name (the P5 record vocabulary).
 */
export declare const EventOf: (State_: TaskState) => string;
export default _default;
declare function _default(State: State, Input_: Input, Append: (Message: string) => void): Task;
