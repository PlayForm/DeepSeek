import type State from "@Interface/State.js";
import type Invocation from "@Interface/Invocation.js";
export default _default;
declare function _default(State: State, Invocation: Invocation, Binary: string, Root: string, Groups: string[], Concurrency: number, Reject: string[], Allow: string[] | undefined, Signal: AbortSignal, Emit?: (text: string) => void): Promise<boolean>;
