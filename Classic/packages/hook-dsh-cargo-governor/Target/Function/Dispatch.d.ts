import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type Registry from "../Interface/Registry.js";
import type State from "../Interface/State.js";
import type PluginFactory from "@playform/plugin-dsh-factory";
/**
 * @module Dispatch
 *
 * The g4 stage (U): the update stage, wrapped in the probed root jobs runtime
 * when one serves this context, otherwise the detached, contained async
 * continuation.
 *
 * @remarks
 *
 * The wrapper probes `ctx.get("jobs")` — never the direct accessor, which
 * throws on a root context. Live-verified 2026-10-03: a root plugin's
 * `ctx.jobs` probe DOES serve a controller (the earlier "ctx.jobs is
 * AGENT-SCOPED — a root plugin has no job controller" premise was REFUTED —
 * jobs.md:398, 42-46, 488-493); the detached continuation remains the fallback
 * runtime when the probe comes up empty. The detached continuation drives the
 * Rust-side cargo CLI (`cargo upgrade`, cargo-edit — the ONLY update path;
 * there is no npm-library equivalent for cargo manifest updates) through the
 * probed-once, optional subprocess seam (State.Subprocess — probed ONCE at
 * State build time by the FACTORY's State builder through Function/Seam) and
 * is fully error-contained, so its rejections can never surface as a tool
 * error.
 *
 * The control flow is the CORE's shared update-stage envelope
 * (@playform/lib-dsh-core, Function/Update): the gates (circuit breaker →
 * in-flight → cooldown), the jobs envelope (unowned job, `cancel`/`done`
 * semantics, the settlement mapping), the P2 Inflight registration under
 * State.Factory.UpdateKey, the breaker update on failure, the P5 journal
 * records and the U₂ stat → Refresh re-emit are the family's. This module
 * supplies the INJECTED DEPENDENCIES: the State's maps, the factory delegates
 * (the explicit Factory parameter — the module's own drift, absorbed here),
 * the jobs probe (contained, live-verified), the child execution stage
 * (Function/Run → Update/Upgrade) and EVERY ledger string — module-owned,
 * byte-identical (the smokes are the arbiter).
 *
 * THE JOBS ENVELOPE (exact semantics of today's continuation): `start` is
 * given kind/label (an UNOWNED job — the owner KEY is absent, the
 * governor-family uniform form) and a `run` callback returning
 *
 * - cancel — aborts the task-owned signal (the run's AbortController).
 * - done — the NEVER-REJECTING settlement promise: Run → Settle → the
 *   { status, detail: `exit code: ${code}` } mapping; a bug-level rejection
 *   settles the breaker and resolves "failed" instead.
 *
 * The cargo CLI's output is piped into `Job.append(...)` IN ADDITION to the
 * ledger digest lines (Function/Update/Upgrade); the ledger record stays
 * byte-identical.
 *
 * P2 — the run's AbortController is registered in State.Inflight at dispatch
 * (under the FACTORY's namespaced key, State.Factory.UpdateKey — DISTINCT from
 * the factory chain pass's plain `String(targetKey)` entry in the same map: a
 * collision would let the chain pass's settlement delete drop the update run's
 * controller) and removed on settlement (Function/Settle / the defensive
 * catch); the FACTORY's Attach disposal effect aborts every remaining
 * controller on unload.
 */
/**
 * The envelope factory: the cargo module's explicit Factory parameter is the
 * drift the core's flow does not carry, so the injected dependencies close over
 * it — one envelope per dispatch, built from the caller's service.
 */
export declare const Envelope: (Factory: PluginFactory) => {
    Dispatch: (State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Registry: Registry | null, PolicyPath: string) => Promise<void>;
    Settle: (State: State, Dir: string, Target: FsTarget, Actor: object | undefined, Code: number) => Promise<number>;
};
export default _default;
declare function _default(Factory: PluginFactory, State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Registry: Registry | null, PolicyPath: string): Promise<void>;
