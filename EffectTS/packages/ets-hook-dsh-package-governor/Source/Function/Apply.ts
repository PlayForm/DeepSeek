// Apply — the plugin entry function, now a THIN MODULE WIRE-UP (the factory
// owns the scaffolding): build the State through `Factory.State` (the cell
// unwrap, the shared mappings Tool←mutationTools, Policy←policyFile,
// Ledger←logFile, Enabled←log, List←exclude, and the machinery structures —
// SCHEME.md §2.10), add the module's own fields via the setup `fields` map,
// delegate ALL lifecycle effects to `Factory.Attach` (P1 jobs controller, P2
// in-flight disposal, P5 storage domain — SCHEME.md §2.12), emit the durable
// activation proof (the module's own string, via Factory.Append +
// Factory.Journal), and wire the fs/observed hook through `Factory.Wire`
// (SCHEME.md §2.11).
//
// The module's own residue, deliberately kept here:
//   * the cooldown / per-dir in-flight / circuit-breaker collections
//     (Stamp, Set, Count) — update-engine state, not factory machinery;
//   * the module identity for the factory ("hook-dsh-governor-package" — doubles as
//     the prefix of every factory-composed line, keeping them byte-identical);
//   * the activation proof string (the module's ledger vocabulary);
//   * the `ctx.__hookDshGovernorPackageState` test probe.
//
// The function returns NOTHING — never a value: the loader treats apply
// return values specially, and a returned State object silently killed event
// delivery (live-verified 2026-10-03). Test probes read the state through the
// `ctx.__hookDshGovernorPackageState` attachment instead.
//
// `inject: ["fs", "pluginFactory"]` — the factory is a REQUIRED service; the
// loader's PENDING state handles the ordering (the plugin loads only when
// both fs and pluginFactory exist). The update stage runs through the
// attached P1 controller (Factory.Attach); the subprocess seam (bin mode) is
// probed once by the factory's State builder (P9).
import { Effect, Scope } from "effect";
import Observe from "./Observe.js";
import * as Direct from "./Direct.js";
import { Activate } from "@playform/ets-base-dsh";
import type Config from "@Interface/Config.js";
import type State from "@Interface/State.js";
import type { Context } from "@deepseek-ai/cordis";

export default (Context: Context, Options: Config): void => {
	// The injected factory service (typed via Interface/Factory's Context
	// augmentation; guaranteed present by the inject declaration).
	const Factory = Context.pluginFactory;
	// The State: the factory's shared shape plus the governor's own fields,
	// copied from the (cell-unwrapped) validated config by the setup map.
	const State: State = Factory.State(Context, Options, {
		module: "hook-dsh-governor-package",
		fields: {
			Strict: "strict",
			Wait: "updateCooldownMs",
			Limit: "maxUpdateFailures",
			Binary: "ncuBin",
			Mode: "updateMode",
		},
		policyFileName: "update-policy.json",
	});
	// The update engine's own collections (module state, not factory
	// machinery): cooldown stamps, per-dir in-flight set, circuit breaker.
	State.Stamp = new Map();
	State.Set = new Set();
	State.Count = new Map();
	State.Factory = Factory;

	// THE EFFECT DELTA (register #13, R3): the plugin's long-lived Effect
	// Scope — the fiber home of the CORE's typed-effect update envelope
	// (Function/Dispatch's `Dispatch: Effect<void, never, Scope.Scope>`).
	// Created synchronously here (apply is a sync seam; `Scope.make` run
	// through `Effect.runSync` is fully synchronous) and provided per
	// dispatch via `Scope.provide` in Function/Dispatch, so the detached
	// fallback continuation is forked INTO the plugin scope (`Effect
	// .forkIn`): interrupted when the scope closes, the interruption
	// aborting the task-owned controller — the interruption-at-dispose
	// semantics of the envelope. The Classic disposal path is unchanged: the
	// P2 Inflight effect (Factory.Attach) still aborts every registered
	// controller on unload, which kills the child stages via their signal.
	// The scope itself is not closed by the loader — the fibers self-complete
	// with their contained chains, and a host that closes the scope gets the
	// fiber interruption for free.
	State.Scope = Effect.runSync(Scope.make());

	// The lifecycle effects, all in the factory now: P1 attaches the jobs
	// controller from this root context (serves every owner), P2 registers the
	// in-flight disposal, P5 opens the optional storage domain.
	Factory.Attach(Context, { state: State, name: "hook-dsh-governor-package" });

	// Durable activation proof — "did it activate" must be answerable from
	// the ledger alone. The same summary becomes the storage journal's
	// `activated` record (P5; queued until the optional domain opens). The
	// line's string mechanics (the `activated (` prefix, the `k=v` join, the
	// `)` suffix) live in the core's Activate composer; the FIELD LIST is the
	// module's own — the leading bare flavor word (empty key), the bracketed
	// lists and the `(discovery)` fallbacks.
	const Proof = Activate([
		["", "anywhere mode"],
		["logFile", State.Ledger],
		["updateMode", State.Mode],
		["ncuBin", State.Binary],
		["exclude", `[${State.List.join(", ")}]`],
		["policyFile", State.Policy || "(discovery)"],
	]);
	Factory.Append(State, Proof);
	Factory.Journal(State, "activated", "", Proof);

	// The listener is owned by the current fiber (Factory.Wire): removed on
	// unload — no manual removeListener bookkeeping, ever.
	Factory.Wire(Context, State, (Target, Observation, Actor) =>
		Observe(State, Target, Observation, Actor),
	);
	// The direct-govern registration (the factory's GovernSteps registry): the
	// raw-write tool's per-call `govern` path. Two steps for the
	// "package.json" basename, in registered order — the chain pass WITHOUT
	// the update follow (Function/Direct.Canonicalize) and the update stage
	// alone (Function/Direct.Update). The closures capture THIS apply's State,
	// so every ledger string stays the module's own, byte-identical.
	Factory.RegisterGovern("package.json", "canonicalize", (Target, Actor, Version) =>
		Direct.Canonicalize(State, Target, Actor, Version),
	);
	Factory.RegisterGovern("package.json", "update", (Target, Actor, Version) =>
		Direct.Update(State, Target, Actor, Version),
	);
	// The loader ignores any return value; the smoke harness probes the
	// per-dir in-flight/breaker maps through this debug attachment instead
	// (a bare `return State` is avoided: loader behavior on apply return
	// values is untrusted — 2026-10-03 incident).
	(Context as { __hookDshGovernorPackageState?: State }).__hookDshGovernorPackageState = State;
};
