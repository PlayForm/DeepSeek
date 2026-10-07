// Dispatch — the g4 stage (U): the update stage, run as a HARNESS JOB
// whenever a job registry serves this context (P1), otherwise as the
// historical DETACHED, CONTAINED async continuation (the fallback for
// sdk-minimal deployments).
//
// THE EFFECT-TS RE-IMPLEMENTATION (register #13, R3): the control flow is
// the CORE's shared update-stage envelope (@playform/hook-dsh-core,
// Function/Update), re-issued as an EFFECT BUILDER — the pair is now
//
//   Dispatch: Effect<void, never, Scope.Scope> — the detached continuation
//     is forked INTO the CALLER's Scope (`Effect.forkIn`), interrupted at
//     dispose, the interruption aborting the task-owned controller;
//   Settle:   Effect<number> — the U₂ stat is best-effort (`Effect.exit`).
//
// so the module's boundary adapts them to the plain seam the rest of the
// module (and the smokes) consume: the default export is still
// `Dispatch(state, target, actor, dir, registry, policyPath)` returning a
// promise — it runs the typed effect through `Effect.runPromise` with the
// STATE's long-lived Scope provided (`Scope.provide`, created in
// Function/Apply, lazily here as a defensive fallback) and the
// `dsh.update.dispatch` span wrapped around it (attributes: dir, mode,
// policy path — read-only facts; the no-op default Tracer makes the span
// free and the ledger untouched). The sync `Effect.runSync` boundaries are
// untouched — this is a promise seam, so the envelope's `Effect
// .tryPromise` stages can never trip the AsyncFiberError rule.
//
// Everything else is the Classic injection surface, byte-identical: the
// gates (circuit breaker → in-flight → cooldown), the jobs envelope
// (unowned job, `cancel`/`done` semantics, the outcome mapping), the P2
// Inflight registration under Factory.UpdateKey, the breaker update on
// failure, the P5 journal records and the U₂ stat → Refresh re-emit are
// the family's; this module supplies the INJECTED DEPENDENCIES: the
// State's maps, the factory delegates, the jobs probe (with the detached
// fallback on a starter rejection), the child execution stage
// (Function/Execute — the ncu modes) and EVERY ledger string —
// module-owned, byte-identical (the smokes are the arbiter).
//
// Jobs mode (P1): the controller attached from the root context — now by
// factory.Attach (SCHEME.md §2.12) — serves every owner (unscoped
// registrations are owner-relative, subsystems/jobs.md), so the update stage
// is registered with `start` as an UNOWNED job (`owner` key absent — open to
// any caller until service disposal). The run returns the exact semantics of
// the old continuation: `cancel` aborts the task-owned signal, `done` is the
// never-rejecting chain Execute → Settle → terminal outcome — the breaker
// settlement and every ledger line are byte-identical — and the bin mode's
// raw CLI output is additionally piped into the job's output ring via
// `Job.append` (the ledger keeps receiving the same lines).
//
// The detached continuation remains for deployments without the registry
// (and for a `start` preflight rejection, which leaves nothing registered -
// jobs.md): the same contained chain, unobserved — now forked on the
// STATE's Scope, so it is also interrupted (and its child aborted) whenever
// that scope closes.
//
// P2 — the task-owned abort signal belongs to this continuation (published
// work outlives the event dispatch — the cookbook's task-owned-signal rule);
// it is registered under the NAMESPACED key (State.Factory.UpdateKey — the
// factory's chain pass keys by the PLAIN targetKey, so a plain key here
// would let the chain pass's settlement delete silently drop the running
// update's controller; the collision lesson is factory-side now) and removed
// on settlement.
import { Effect, Scope } from "effect";
import Execute from "./Execute.js";
import { Update } from "@playform/hook-dsh-core";
import type State from "@Interface/State.js";
import type Registry from "@Interface/Registry.js";
import type JobsRegistry from "@Interface/Jobs.js";
import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";

// The envelope, built once: every dependency is a closure over the State it
// is handed per dispatch — no module-level State, so HMR reloads rebind it
// cleanly (the governor-family pattern). Shared with Function/Settle, the
// settlement half of the same pair.
export const Envelope = Update<State, FsTarget, FsVersion, Registry>({
	// The State's gate machinery (the maps and functions the flow guards
	// dispatch with — never imported, always injected).
	Count: (State) => State.Count,
	Stamp: (State) => State.Stamp,
	Set: (State) => State.Set,
	Inflight: (State) => State.Inflight,
	Limit: (State) => State.Limit,
	Wait: (State) => State.Wait,
	UpdateKey: (State, Target) => State.Factory.UpdateKey(Target),
	// The FACTORY delegates — the ledger and journal lines go through
	// State.Factory.Append / State.Factory.Journal, the U₂ re-emit through
	// State.Factory.Refresh; the strings are the module's.
	Append: (State, Message) => State.Factory.Append(State, Message),
	Journal: (State, Event, Dir, Detail) => State.Factory.Journal(State, Event, Dir, Detail),
	Refresh: (State, Target, Actor, Version) =>
		State.Factory.Refresh(State, Target, Actor, Version),
	Stat: (State, Target) => State.Context.fs.stat(Target),
	// The jobs probe: the registry is probed (optional, never injected); a
	// throwing starter leaves nothing registered (jobs.md), so the preflight
	// rejection falls back to the detached continuation — no double-start.
	Start: (State, Spec, Detached) => {
		const Start = (State.Context.get?.("jobs") as JobsRegistry | undefined)?.start;
		switch (true) {
			case typeof Start === "function":
				try {
					Start(Spec);
				} catch {
					Detached(); // preflight rejection — today's detached continuation
				}
				break;
			default:
				Detached(); // no job registry serves this context (sdk-minimal)
		}
	},
	// The module's ledger strings — byte-identical (the smokes are the
	// arbiter).
	Lines: {
		Paused: (Dir, Count, Limit) =>
			`update stage paused for ${Dir} (${Count} consecutive failures ≥ ${Limit})`,
		InFlight: (Dir) => `update stage skipped for ${Dir} (in-flight)`,
		Cooldown: (Dir) => `update stage skipped for ${Dir} (cooldown)`,
		Failed: (Dir, Code, Consecutive) =>
			`update stage FAILED (${Code}) for ${Dir}; consecutive=${Consecutive}`,
		Dispatched: (State, Dir, PolicyPath) =>
			`update stage dispatched for ${Dir} (mode=${State.Mode}, ncu via ${State.Binary}${PolicyPath ? `, policy ${PolicyPath}` : ", built-in default policy"})`,
	},
	DispatchedEvent: "dispatched",
	DispatchedDetail: (State) => State.Mode,
	FailedEvent: "update-failed",
	Kind: "governor-update",
	Label: (Dir) => `ncu ${Dir}`,
	RejectedDetail: "internal error",
	// The child execution stage (the module's drift): the ncu modes, with the
	// optional job-ring pipe (P1) — in bin mode the raw CLI output is appended
	// to the harness job's output ring IN ADDITION to the ledger; undefined in
	// the detached fallback (nothing to append to).
	Stage: (State, Dir, Target, Actor, Registry, PolicyPath, Signal, Job) =>
		Execute(
			State,
			Dir,
			Target,
			Actor,
			Registry,
			PolicyPath,
			Signal,
			Job
				? (Text) => {
						try {
							Job.append(Text);
						} catch {
							/* ring append best-effort */
						}
					}
				: undefined,
		),
});

// THE BOUNDARY: run the typed-effect envelope at the module's plain-promise
// seam. The `dsh.update.dispatch` span wraps the whole dispatch (the gates,
// the jobs envelope and the detached fork all complete inside it); the
// STATE's long-lived Scope (created in Function/Apply) is provided via
// `Scope.provide` — the envelope's `yield* Effect.scope` returns it, so the
// detached fallback fiber is forked INTO the plugin scope (`Effect
// .forkIn`): interrupted at dispose, the interruption aborting the
// task-owned controller. The effect never fails (the envelope's gates log
// and return; the child stages are contained inside), so the promise
// resolves when the stage is DISPATCHED — the background job keeps
// running — and the ledger shows the progress exactly as before.
export default (
	State: State,
	Target: FsTarget,
	Actor: object | undefined,
	Dir: string,
	Registry: Registry | null,
	PolicyPath: string,
): Promise<void> => {
	// The fiber home: the apply-created scope, or (defensively — a State
	// built outside apply never dispatches in production) a lazily-created
	// one, cached on the State so later dispatches share it.
	const FiberHome = State.Scope ?? (State.Scope = Scope.makeUnsafe("sequential"));
	return Effect.runPromise(
		Envelope.Dispatch(State, Target, Actor, Dir, Registry, PolicyPath).pipe(
			Effect.withSpan("dsh.update.dispatch", {
				attributes: {
					dir: Dir,
					mode: State.Mode,
					policy: PolicyPath || "built-in default policy",
				},
			}),
			Scope.provide(FiberHome),
		),
	);
};
