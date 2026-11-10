/**
 * @module Run
 *
 * The update stage's body: the Rust-side cargo invocation and the optional
 * verify stage.
 *
 * @remarks
 * Runs in the detached continuation started by Function/Dispatch; the SAME
 * ROLE as the package.json governor's Function/Update/Run - the naming
 * unification, P4. The policy is resolved in-process (the same non-quiet
 * materialization as the parent governor - the policy ledger lines belong to
 * the job), the chain deps are merged into cargo upgrade's --exclude list
 * (the cordis-trap analog: the CLI must never bump a chain-governed pin),
 * the single invocation runs through the Rust-side CLI (Function/Update/
 * Upgrade - there is no npm-library equivalent for cargo manifest updates),
 * and the optional verifyCommand follows. Returns an exit-style code: 0
 * success, 1 the cargo or verify stage failed - the code feeds the "update
 * stage FAILED (<code>)" ledger line, mirroring the child's exit status in
 * the parent governor.
 *
 * Never rejects: every stage is contained; the promise always resolves a
 * code. The ledger lines go through the FACTORY's Append (State.Module
 * supplies the "hook-dsh-governor-cargo" prefix - the strings stay the
 * module's).
 */
import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type Job from "../Interface/Job.js";
import type Registry from "../Interface/Registry.js";
import type State from "../Interface/State.js";
import type PluginFactory from "@playform/ets-plugin-dsh-factory";
export default _default;
declare function _default(Factory: PluginFactory, State: State, Root: string, Target: FsTarget, _Actor: object | undefined, Registry: Registry | null, PolicyPath: string, Signal: AbortSignal, Sink: Job | undefined): Promise<number>;
