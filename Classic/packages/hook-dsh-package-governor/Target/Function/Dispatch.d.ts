import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type Registry from "../Interface/Registry.js";
import type State from "../Interface/State.js";
/**
 * @module Dispatch
 *
 * The g4 stage (U): the update stage, run as a harness job whenever a job registry serves
 * this context, otherwise as the historical detached, contained async continuation.
 *
 * @remarks
 *
 * The detached continuation is the fallback for sdk-minimal deployments.
 *
 * The control flow is the CORE's shared update-stage envelope (@playform/lib-dsh-core,
 * Function/Update): the gates (circuit breaker -> in-flight -> cooldown), the jobs envelope
 * (unowned job, `cancel`/`done` semantics, the outcome mapping), the P2 Inflight registration
 * under Factory.UpdateKey, the breaker update on failure, the P5 journal records and the U₂
 * stat -> Refresh re-emit are the family's. This module supplies the INJECTED DEPENDENCIES:
 * the State's maps, the factory delegates, the jobs probe (with the detached fallback on a
 * starter rejection), the child execution stage (Function/Execute - the ncu modes) and EVERY
 * ledger string - module-owned, byte-identical (the smokes are the arbiter).
 *
 * Jobs mode (P1): the controller attached from the root context - now by factory.Attach
 * (SCHEME.md §2.12) - serves every owner (unscoped registrations are owner-relative,
 * subsystems/jobs.md), so the update stage is registered with `start` as an UNOWNED job (the
 * `owner` key absent - open to any caller until service disposal). The run returns the exact
 * semantics of the old continuation: `cancel` aborts the task-owned signal, `done` is the
 * never-rejecting chain Execute -> Settle -> terminal outcome - the breaker settlement and
 * every ledger line are byte-identical - and the bin mode's raw CLI output is additionally
 * piped into the job's output ring via `Job.append` (the ledger keeps receiving the same
 * lines).
 *
 * The detached continuation remains for deployments without the registry (and for a `start`
 * preflight rejection, which leaves nothing registered - jobs.md): the same contained chain,
 * unobserved.
 *
 * P2 - the task-owned abort signal belongs to this continuation (published work outlives the
 * event dispatch - the cookbook's task-owned-signal rule); it is registered under the
 * NAMESPACED key (State.Factory.UpdateKey - the factory's chain pass keys by the PLAIN
 * targetKey, so a plain key here would let the chain pass's settlement delete silently drop
 * the running update's controller; the collision lesson is factory-side now) and removed on
 * settlement.
 */
export declare const Envelope: {
    Dispatch: (State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Registry: Registry | null, PolicyPath: string) => Promise<void>;
    Settle: (State: State, Dir: string, Target: FsTarget, Actor: object | undefined, Code: number) => Promise<number>;
};
declare const _default: (State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Registry: Registry | null, PolicyPath: string) => Promise<void>;
export default _default;
