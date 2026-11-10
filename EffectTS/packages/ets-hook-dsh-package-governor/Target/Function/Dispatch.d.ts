import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type Registry from "../Interface/Registry.js";
import type State from "../Interface/State.js";
import { Effect, Scope } from "effect";
/**
 * @module Dispatch
 *
 * The g4 stage (U): the update stage, run as a harness job whenever a job
 * registry serves this context, otherwise as the historical detached, contained
 * async continuation.
 *
 * @remarks
 *
 * THE EFFECT-TS RE-IMPLEMENTATION (register #13, R3): the control flow is the
 * CORE's shared update-stage envelope (@playform/ets-lib-dsh-core,
 * Function/Update), re-issued as an EFFECT BUILDER - the pair is now:
 * - Dispatch: Effect<void, never, Scope.Scope> - the detached continuation is
 *   forked INTO the CALLER's Scope (`Effect.forkIn`), interrupted at dispose,
 *   the interruption aborting the task-owned controller;
 * - Settle: Effect<number> - the U2 stat is best-effort (`Effect.exit`).
 *
 * The module's boundary adapts them to the plain seam the rest of the module
 * (and the smokes) consume: the default export is still
 * `Dispatch(state, target, actor, dir, registry, policyPath)` returning a
 * promise - it runs the typed effect through `Effect.runPromise` with the
 * STATE's long-lived Scope provided (`Scope.provide`, created in
 * Function/Apply, lazily here as a defensive fallback) and the
 * `dsh.update.dispatch` span wrapped around it (attributes: dir, mode, policy
 * path - read-only facts; the no-op default Tracer makes the span free and the
 * ledger untouched). The sync `Effect.runSync` boundaries are untouched - this
 * is a promise seam, so the envelope's `Effect.tryPromise` stages can never
 * trip the AsyncFiberError rule.
 *
 * Everything else is the Classic injection surface, byte-identical: the gates
 * (circuit breaker -> in-flight -> cooldown), the jobs envelope (unowned job,
 * `cancel`/`done` semantics, the outcome mapping), the P2 Inflight registration
 * under Factory.UpdateKey, the breaker update on failure, the P5 journal
 * records and the U2 stat -> Refresh re-emit are the family's; this module
 * supplies the INJECTED DEPENDENCIES: the State's maps, the factory delegates,
 * the jobs probe (with the detached fallback on a starter rejection), the child
 * execution stage (Function/Execute - the ncu modes) and EVERY ledger string -
 * module-owned, byte-identical (the smokes are the arbiter).
 *
 * Jobs mode (P1): the controller attached from the root context - now by
 * factory.Attach (SCHEME.md §2.12) - serves every owner (unscoped registrations
 * are owner-relative, subsystems/jobs.md), so the update stage is registered
 * with `start` as an UNOWNED job (`owner` key absent - open to any caller until
 * service disposal). The run returns the exact semantics of the old
 * continuation: `cancel` aborts the task-owned signal, `done` is the
 * never-rejecting chain Execute -> Settle -> terminal outcome - the breaker
 * settlement and every ledger line are byte-identical - and the bin mode's raw
 * CLI output is additionally piped into the job's output ring via `Job.append`
 * (the ledger keeps receiving the same lines).
 *
 * The detached continuation remains for deployments without the registry (and
 * for a `start` preflight rejection, which leaves nothing registered -
 * jobs.md): the same contained chain, unobserved - now forked on the STATE's
 * Scope, so it is also interrupted (and its child aborted) whenever that scope
 * closes.
 *
 * P2 - the task-owned abort signal belongs to this continuation (published work
 * outlives the event dispatch - the cookbook's task-owned-signal rule); it is
 * registered under the NAMESPACED key (State.Factory.UpdateKey - the factory's
 * chain pass keys by the PLAIN targetKey, so a plain key here would let the
 * chain pass's settlement delete silently drop the running update's controller;
 * the collision lesson is factory-side now) and removed on settlement.
 */
/**
 * The envelope, built once: every dependency is a closure over the State it is
 * handed per dispatch - no module-level State, so HMR reloads rebind it
 * cleanly (the governor-family pattern). Shared with Function/Settle, the
 * settlement half of the same pair.
 */
export declare const Envelope: {
    Dispatch: (State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Registry: Registry | null, PolicyPath: string) => Effect.Effect<void, never, Scope.Scope>;
    Settle: (State: State, Dir: string, Target: FsTarget, Actor: object | undefined, Code: number) => Effect.Effect<number>;
};
export default _default;
/**
 * THE BOUNDARY: run the typed-effect envelope at the module's plain-promise
 * seam. The `dsh.update.dispatch` span wraps the whole dispatch (the gates,
 * the jobs envelope and the detached fork all complete inside it); the STATE's
 * long-lived Scope (created in Function/Apply) is provided via
 * `Scope.provide` - the envelope's `yield* Effect.scope` returns it, so the
 * detached fallback fiber is forked INTO the plugin scope (`Effect.forkIn`):
 * interrupted at dispose, the interruption aborting the task-owned controller.
 * The effect never fails (the envelope's gates log and return; the child
 * stages are contained inside), so the promise resolves when the stage is
 * DISPATCHED - the background job keeps running - and the ledger shows the
 * progress exactly as before.
 */
declare function _default(State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Registry: Registry | null, PolicyPath: string): Promise<void>;
