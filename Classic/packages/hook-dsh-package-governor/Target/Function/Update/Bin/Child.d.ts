import type Invocation from "../../../Interface/Invocation.js";
import type State from "../../../Interface/State.js";
export default _default;
/**
 * @module Child
 *
 * The minimal fallback path of the bin-mode runner: used when no subprocess seam exists in
 * this deployment.
 *
 * @remarks
 *
 * Asynchronous (the continuation owns the wait); the abort signal kills the child.
 */
declare function _default(State: State, Invocation: Invocation, Binary: string, Root: string, Argv: string[], Signal: AbortSignal, Emit?: (text: string) => void): Promise<boolean>;
