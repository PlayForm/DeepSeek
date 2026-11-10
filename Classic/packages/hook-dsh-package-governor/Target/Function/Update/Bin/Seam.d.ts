import type SubprocessService from "@deepseek-ai/dsh-subprocess";
import type Invocation from "../../../Interface/Invocation.js";
import type State from "../../../Interface/State.js";
export default _default;
/**
 * @module Seam
 *
 * The confined spawn path of the bin-mode runner.
 *
 * @remarks
 *
 * The binary path is verified/resolved through the seam's resolveExecutable first (the host
 * PATH is not the user's shell PATH); a spawn/provider failure rejects Handle.done - mapped
 * to the same ledger line the old spawnSync error branch produced.
 */
declare function _default(State: State, Seam: SubprocessService, Invocation: Invocation, Binary: string, Root: string, Argv: string[], Signal: AbortSignal, Emit?: (text: string) => void): Promise<boolean>;
