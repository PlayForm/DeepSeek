import type State from "@Interface/State.js";
import type Task from "@Interface/Task.js";
/** The settle callback: `true` = completed, `false` = failed. */
export type Settle = (Id: string, Completed: boolean) => void;
export default _default;
declare function _default(State: State, Task_: Task, Append: (Message: string) => void, Settle?: Settle): Promise<void>;
