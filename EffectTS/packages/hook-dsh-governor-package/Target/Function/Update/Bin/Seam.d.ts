import type State from "@Interface/State.js";
import type Invocation from "@Interface/Invocation.js";
import type SubprocessService from "@deepseek-ai/dsh-subprocess";
export default _default;
declare function _default(State: State, Seam: SubprocessService, Invocation: Invocation, Binary: string, Root: string, Argv: string[], Signal: AbortSignal, Emit?: (text: string) => void): Promise<boolean>;
