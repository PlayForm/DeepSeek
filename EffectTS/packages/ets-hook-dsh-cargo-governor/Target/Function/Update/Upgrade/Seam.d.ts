import type SubprocessService from "@deepseek-ai/dsh-subprocess";
import type Invocation from "../../../Interface/Invocation.js";
import type Job from "../../../Interface/Job.js";
import type State from "../../../Interface/State.js";
import type PluginFactory from "@playform/ets-plugin-dsh-factory";
export default _default;
/**
 * @module Seam
 *
 * The confined spawn path of the cargo upgrade runner.
 *
 * @remarks
 *
 * The binary path is verified/resolved through the seam's resolveExecutable
 * first (the host PATH is not the user's shell PATH); a spawn/provider
 * failure rejects Handle.done - mapped to the graceful unavailable path.
 */
declare function _default(Factory: PluginFactory, State: State, Seam: SubprocessService, Binary: string, Argv: string[], Cwd: string, Invocation: Invocation, Signal: AbortSignal, Sink: Job | undefined): Promise<boolean>;
