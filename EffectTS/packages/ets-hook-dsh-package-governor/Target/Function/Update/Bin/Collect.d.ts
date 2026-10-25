import type { SubprocessHandle } from "@deepseek-ai/dsh-subprocess";
import type State from "@Interface/State.js";
declare const _default: (State: State, Handle: SubprocessHandle, Channel: "stdout" | "stderr", Emit: ((text: string) => void) | undefined) => void;
export default _default;
