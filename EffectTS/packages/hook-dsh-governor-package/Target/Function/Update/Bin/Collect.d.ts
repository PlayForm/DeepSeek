import type State from "@Interface/State.js";
import type { SubprocessHandle } from "@deepseek-ai/dsh-subprocess";
export default _default;
declare function _default(State: State, Handle: SubprocessHandle, Channel: "stdout" | "stderr", Emit: ((text: string) => void) | undefined): void;
