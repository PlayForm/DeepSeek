import type State from "../Interface/State.js";
import type Task from "../Interface/Task.js";
import type { TaskState } from "../Interface/Task.js";
/** The enqueue input: everything except the id/seq/state bookkeeping. Each
 * optional field may also be explicitly undefined (the tool's parsed
 * arguments arrive that way). */
export interface Input {
    spec: string;
    role?: Task["role"];
    priority?: number | undefined;
    dependsOn?: string[] | undefined;
}
/** Map a state flip to the journal event name (the P5 record vocabulary). */
export declare const EventOf: (State_: TaskState) => string;
export default _default;
declare function _default(State: State, Input_: Input, Append: (Message: string) => void): Task;
