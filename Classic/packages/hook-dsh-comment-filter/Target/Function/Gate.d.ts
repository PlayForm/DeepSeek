import type State from "../Interface/State.js";
/** The structural tool execution: only the fields the gate reads. */
type Execution = {
    name?: unknown;
    agent?: unknown;
};
export default _default;
declare function _default(State: State, Exec: Execution): boolean;
