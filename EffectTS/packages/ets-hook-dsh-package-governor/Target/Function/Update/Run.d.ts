import type Invocation from "@Interface/Invocation.js";
import type State from "@Interface/State.js";
export default _default;
/**
 * @module Run
 *
 * Dispatches every policy invocation through the selected mode.
 *
 * @remarks
 *
 * The modes are "bin" (the ncu binary via the stored subprocess seam) or the
 * default programmatic library path. Reports whether all invocations succeeded.
 * Runs inside the detached update continuation (no child process): ledger lines
 * go through the FACTORY (State.Factory.Append); in bin mode the raw CLI output
 * is additionally piped to the optional job ring (Emit, P1).
 */
declare function _default(State: State, Mode: string, Invocations: Invocation[], Root: string, Groups: string[], Concurrency: number, Reject: string[], Allow: string[] | undefined, Binary: string, Signal: AbortSignal, Emit?: (text: string) => void): Promise<boolean>;
