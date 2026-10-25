import type Invocation from "@Interface/Invocation.js";
import type State from "@Interface/State.js";
declare const _default: (State: State, Invocation: Invocation, Binary: string, Root: string, Argv: string[], Signal: AbortSignal, Emit?: (text: string) => void) => Promise<boolean>;
export default _default;
