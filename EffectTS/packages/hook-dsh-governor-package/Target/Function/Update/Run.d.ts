import type State from "@Interface/State.js";
import type Invocation from "@Interface/Invocation.js";
export default _default;
declare function _default(State: State, Mode: string, Invocations: Invocation[], Root: string, Groups: string[], Concurrency: number, Reject: string[], Allow: string[] | undefined, Binary: string, Signal: AbortSignal, Emit?: (text: string) => void): Promise<boolean>;
