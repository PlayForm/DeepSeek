import type { SubprocessHandle } from "@deepseek-ai/dsh-subprocess";
export default _default;
/**
 * @module Collect
 *
 * Reads one collected stream from the subprocess handle.
 *
 * @remarks
 *
 * Best-effort; collect readers are offset-based and stay readable after exit.
 * Shared by the seam and the child-fallback paths.
 */
declare function _default(Handle: SubprocessHandle, Channel: "stdout" | "stderr"): string;
