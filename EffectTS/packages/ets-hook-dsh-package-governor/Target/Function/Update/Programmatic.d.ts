import type Invocation from "@Interface/Invocation.js";
import type State from "@Interface/State.js";
export default _default;
declare function _default(State: State, Invocation: Invocation, Root: string, Groups: string[], Concurrency: number, Reject: string[], Allow: string[] | undefined): Promise<boolean>;
