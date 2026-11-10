import type Invocation from "../../../Interface/Invocation.js";
import type Job from "../../../Interface/Job.js";
import type State from "../../../Interface/State.js";
import type PluginFactory from "@playform/ets-plugin-dsh-factory";
export default _default;
/**
 * @module Child
 *
 * The minimal fallback path of the cargo upgrade runner: used when no
 * subprocess seam exists in this deployment.
 *
 * @remarks
 *
 * Asynchronous (the continuation owns the wait); the abort signal kills the
 * child. The process management is not exempt - only the cargo CLI is.
 */
declare function _default(Factory: PluginFactory, State: State, Binary: string, Argv: string[], Cwd: string, Invocation: Invocation, Signal: AbortSignal, Sink: Job | undefined): Promise<boolean>;
