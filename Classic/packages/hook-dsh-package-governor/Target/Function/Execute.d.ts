/**
 * @module Execute
 *
 * The update stage's body: policy resolution in-process, merged rejects, mode invocations and
 * the optional verify stage.
 *
 * @remarks
 * The function runs in the detached continuation started by Function/Dispatch. The policy is
 * resolved in-process, the chain deps are merged into ncu's reject list (the cordis-trap
 * guard: ncu must never bump a chain pin to public npm latest), every invocation runs through
 * the selected mode, and the optional verifyCommand follows. Returns an exit-style code: 0
 * success, 1 the ncu stage failed, 2 the verify stage failed - the code feeds the JobOutcome
 * detail and the "update stage FAILED (<code>)" ledger line, mirroring the old child's exit
 * status.
 *
 * Never rejects: every stage is contained; the promise always resolves a code. Ledger lines
 * go through the FACTORY (State.Factory.Append) - the strings are the module's.
 */
import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type Registry from "../Interface/Registry.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Root: string, _Target: FsTarget, _Actor: object | undefined, Registry: Registry | null, PolicyPath: string, Signal: AbortSignal, Emit?: (text: string) => void): Promise<number>;
