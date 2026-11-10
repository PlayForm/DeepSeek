import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type Registry from "../Interface/Registry.js";
import type State from "../Interface/State.js";
import type PluginFactory from "@playform/ets-plugin-dsh-factory";
import { Effect, Scope } from "effect";
/**
 * @module Dispatch
 *
 * The g4 stage (U): the update stage, wrapped in the PROBED root jobs
 * runtime when one serves this context, otherwise the DETACHED, CONTAINED
 * async continuation.
 *
 * @remarks
 *
 * The probed runtime is `ctx.get("jobs")` - never the direct accessor, which
 * throws on a root context. Live-verified 2026-10-03: a root plugin's
 * `ctx.jobs` probe DOES serve a controller (the earlier "ctx.jobs is
 * AGENT-SCOPED - a root plugin has no job controller" premise was REFUTED -
 * jobs.md:398, 42-46, 488-493); the detached continuation remains the
 * fallback runtime when the probe comes up empty. The detached continuation
 * drives the Rust-side cargo CLI (`cargo upgrade`, cargo-edit - the ONLY
 * update path; there is no npm-library equivalent for cargo manifest
 * updates) through the probed-once, optional subprocess seam
 * (State.Subprocess - probed ONCE at State build time by the FACTORY's State
 * builder through Function/Seam) and is fully error-contained, so its
 * rejections can never surface as a tool error.
 *
 * THE EFFECT-TS RE-IMPLEMENTATION (register #13, R5, mirroring the R3
 * governor): the control flow is the CORE's shared update-stage envelope
 * (@playform/ets-lib-dsh-core, Function/Update), re-issued as an EFFECT
 * BUILDER - the pair is now
 *
 *   Dispatch: Effect<void, never, Scope.Scope> - the detached continuation
 *     is forked INTO the CALLER's Scope (`Effect.forkIn`), interrupted at
 *     dispose, the interruption aborting the task-owned controller;
 *   Settle:   Effect<number> - the U₂ stat is best-effort (`Effect.exit`).
 *
 * so the module's boundary adapts them to the plain seam the rest of the
 * module (and the smokes) consume: the default export is still
 * `Dispatch(factory, state, target, actor, dir, registry, policyPath)`
 * returning a promise - it builds the module's envelope from the caller's
 * factory (the explicit Factory parameter is the module's own drift - the
 * cargo's `Envelope(Factory)` shape is preserved) and runs the typed effect
 * through `Effect.runPromise` with the STATE's long-lived Scope provided
 * (`Scope.provide`, created in Function/Apply, lazily here as a defensive
 * fallback) and the `dsh.update.dispatch` span wrapped around it
 * (attributes: dir, mode, policy path - read-only facts; the no-op default
 * Tracer makes the span free and the ledger untouched). The sync
 * `Effect.runSync` boundaries are untouched - this is a promise seam, so
 * the envelope's `Effect.tryPromise` stages can never trip the
 * AsyncFiberError rule.
 *
 * Everything else is the Classic injection surface, byte-identical: the
 * gates (circuit breaker -> in-flight -> cooldown), the jobs envelope
 * (unowned job, `cancel`/`done` semantics, the settlement mapping), the P2
 * Inflight registration under State.Factory.UpdateKey, the breaker update
 * on failure, the P5 journal records and the U₂ stat -> Refresh re-emit are
 * the family's. This module supplies the INJECTED DEPENDENCIES: the State's
 * maps, the factory delegates (the explicit Factory parameter - the
 * module's own drift, absorbed here), the jobs probe (contained,
 * live-verified), the child execution stage (Function/Run ->
 * Update/Upgrade) and EVERY ledger string - module-owned, byte-identical
 * (the smokes are the arbiter).
 *
 * THE JOBS ENVELOPE (exact semantics of today's continuation): `start` is
 * given kind/label (an UNOWNED job - the owner KEY is absent, the
 * governor-family uniform form) and a `run` callback returning
 *   cancel - aborts the task-owned signal (the run's AbortController), and
 *   done   - the NEVER-REJECTING settlement promise: Run -> Settle -> the
 *            { status, detail: `exit code: ${code}` } mapping; a bug-level
 *            rejection settles the breaker and resolves "failed" instead.
 * The cargo CLI's output is piped into `Job.append(...)` IN ADDITION to the
 * ledger digest lines (Function/Update/Upgrade); the ledger record stays
 * byte-identical.
 *
 * P2 - the run's AbortController is registered in State.Inflight at dispatch
 * (under the FACTORY's namespaced key, State.Factory.UpdateKey - DISTINCT
 * from the factory chain pass's plain `String(targetKey)` entry in the same
 * map: a collision would let the chain pass's settlement delete drop the
 * update run's controller) and removed on settlement (Function/Settle / the
 * defensive catch); the FACTORY's Attach disposal effect aborts every
 * remaining controller on unload.
 */
/**
 * The envelope factory: the cargo module's explicit Factory parameter is the
 * drift the core's flow does not carry, so the injected dependencies close
 * over it - one envelope per dispatch, built from the caller's service.
 * Shared with Function/Settle, the settlement half of the same pair.
 */
export declare const Envelope: (Factory: PluginFactory) => {
    Dispatch: (State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Registry: Registry | null, PolicyPath: string) => Effect.Effect<void, never, Scope.Scope>;
    Settle: (State: State, Dir: string, Target: FsTarget, Actor: object | undefined, Code: number) => Effect.Effect<number>;
};
export default _default;
/**
 * THE BOUNDARY: run the typed-effect envelope at the module's plain-promise
 * seam. The `dsh.update.dispatch` span wraps the whole dispatch (the gates,
 * the jobs envelope and the detached fork all complete inside it); the
 * STATE's long-lived Scope (created in Function/Apply) is provided via
 * `Scope.provide` - the envelope's `yield* Effect.scope` returns it, so the
 * detached fallback fiber is forked INTO the plugin scope (`Effect
 * .forkIn`): interrupted at dispose, the interruption aborting the
 * task-owned controller. The effect never fails (the envelope's gates log
 * and return; the child stages are contained inside), so the promise
 * resolves when the stage is DISPATCHED - the background job keeps
 * running - and the ledger shows the progress exactly as before.
 */
declare function _default(Factory: PluginFactory, State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Registry: Registry | null, PolicyPath: string): Promise<void>;
