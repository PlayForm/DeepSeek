import type State from "@Interface/State.js";
import type Task from "@Interface/Task.js";
import type { TaskState } from "@Interface/Task.js";
export default _default;
declare function _default(State: State, Id: string, Next: Exclude<TaskState, "queued" | "dispatched">, ResultHash?: string, Append?: (Message: string) => void): Task | undefined;
