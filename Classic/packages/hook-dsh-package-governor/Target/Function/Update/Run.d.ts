import type Invocation from "@Interface/Invocation.js";
import type State from "@Interface/State.js";
declare const _default: (State: State, Mode: string, Invocations: Invocation[], Root: string, Groups: string[], Concurrency: number, Reject: string[], Allow: string[] | undefined, Binary: string, Signal: AbortSignal, Emit?: (text: string) => void) => Promise<boolean>;
export default _default;
