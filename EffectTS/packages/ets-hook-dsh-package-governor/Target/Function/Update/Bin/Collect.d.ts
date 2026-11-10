/**
 * @module Collect
 *
 * Pipes one collected stream to the ledger and the job ring.
 *
 * @remarks
 * Best-effort; collect readers are offset-based and stay readable after exit.
 */
import type { SubprocessHandle } from "@deepseek-ai/dsh-subprocess";
import type State from "../../../Interface/State.js";
export default _default;
declare function _default(State: State, Handle: SubprocessHandle, Channel: "stdout" | "stderr", Emit: ((text: string) => void) | undefined): void;
