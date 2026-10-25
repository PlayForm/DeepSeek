import type { SubprocessHandle } from "@deepseek-ai/dsh-subprocess";
import type State from "../../../Interface/State.js";
export default _default;
declare function _default(State: State, Handle: SubprocessHandle, Channel: "stdout" | "stderr", Emit: ((text: string) => void) | undefined): void;
