// Apply — the plugin entry function (CARGO MODULE), now a THIN COMPOSITION
// of the @playform/dsh-plugin-factory service (the family's first service
// provider, injected as `pluginFactory` — see Library.ts):
//
//   1. State — the factory's State builder (cell unwrap, the fixed shared
//      mappings Tool←mutationTools / Policy←policyFile / Ledger←logFile /
//      Enabled←log / List←exclude, the module fields by name, the fresh
//      Stash/Inflight/Seams/Queue structures and the P9 probe-once
//      "subprocess" seam through the factory's Function/Seam). The module
//      adds its own update-stage collections (Stamp/Set/Count) on top.
//   2. The activation proof — the module's OWN Append + Journal: "did it
//      activate" must be answerable from the ledger alone, and the CARGO
//      MODULE string is distinct from the package.json governor's.
//   3. Wire — the factory's fiber-owned fs/observed registration (the
//      module supplies its observe; the hook is fs/observed ONLY — never
//      fs/write-intent / fs/edit-intent, never tools/*).
//   4. Attach — the factory's lifecycle effects: P1 (the root jobs
//      controller, probed via ctx.get), P2 (the in-flight disposal — every
//      detached continuation's abort controller is aborted and cleared on
//      unload) and P5 (the optional storageDomain — the package_governance
//      journal; absent → silent skip, the sink retired).
//
// The function returns NOTHING — never a value: the loader treats apply
// return values specially, and a returned State object silently killed event
// delivery (live-verified 2026-10-03). Test probes read the per-dir
// in-flight/breaker maps through the `ctx.__hookDshGovernorCargoState` attachment
// instead.
import Observe from "./Observe.js";
import * as Direct from "./Direct.js";
import { Activate } from "@playform/hook-dsh-core";
import type Config from "@Interface/Config.js";
import type StateView from "@Interface/State.js";
import type { Context } from "@deepseek-ai/cordis";

export default (Context: Context, Options: Config): void => {
	// The injected factory service (inject: ["fs", "pluginFactory"] — the
	// plugin stays PENDING until both exist; the accessor is the consumption
	// form declared by Interface/Factory).
	const Factory = Context.pluginFactory;
	// 1. The factory's State builder. The module fields are copied from the
	//    (cell-unwrapped) config by name; "Section" and "PinStyle" map config
	//    keys this module's schema does not define (the identified dependency
	//    tables are parse-derived, the chain pin style is policy-file-driven),
	//    so those two fields are inert — kept for the State-builder contract.
	const State = Factory.State<StateView>(Context, Options, {
		module: "hook-dsh-governor-cargo",
		fields: {
			Section: "sections",
			Policy: "policyFile",
			Wait: "updateCooldownMs",
			Limit: "maxUpdateFailures",
			CargoBin: "cargoBin",
			KeepFile: "keepFile",
			Strict: "strict",
			PinStyle: "pinStyle",
			Mode: "updateMode",
		},
		policyFileName: "pin-policy.json",
	});
	// The update stage's per-directory collections (cooldown, in-flight set,
	// circuit breaker) — module-owned loop control on top of the shared shape.
	State.Stamp = new Map();
	State.Set = new Set();
	State.Count = new Map();
	// The injected factory service stored on the State (the governor-family
	// pattern): the P2 UpdateKey helper and the ledger/journal delegates
	// consume it from every module function.
	State.Factory = Factory;

	// 2. The durable activation proof — the module's own ledger line (byte-
	//    identical with the pre-refactor module) plus the structured P5
	//    journal record (queued until the optional storage domain opens). The
	//    line's string mechanics live in the core's Activate composer; the
	//    FIELD LIST is the module's own — the leading bare flavor word (empty
	//    key), the bracketed lists and the `(discovery)` fallbacks.
	Factory.Append(
		State,
		Activate([
			["", "cargo flavor"],
			["logFile", State.Ledger],
			["updateMode", State.Mode],
			["cargoBin", State.CargoBin],
			["exclude", `[${State.List.join(", ")}]`],
			["policyFile", State.Policy || "(discovery)"],
			["keepFile", State.KeepFile || "(discovery)"],
		]),
	);
	Factory.Journal(State, "activated", "", State.Mode);

	// 3. Wire — the factory's fs/observed registration; the listener is owned
	//    by the current fiber: removed on unload, no manual bookkeeping, ever.
	Factory.Wire(Context, State, (Target, Observation, Actor) =>
		Observe(Factory, State, Target, Observation, Actor),
	);

	// 3b. The direct-govern registration (the factory's GovernSteps registry):
	//     the raw-write tool's per-call `govern` path. Two steps for the
	//     "Cargo.toml" basename, in registered order — the chain +
	//     normalization pass WITHOUT the update stage (Function/Direct.Cargo)
	//     and the update stage alone (Function/Direct.Update). The closures
	//     capture THIS apply's State, so every ledger string stays the
	//     module's own, byte-identical.
	Factory.RegisterGovern("Cargo.toml", "cargo", (Target, Actor, Version) =>
		Direct.Cargo(Factory, State, Target, Actor, Version),
	);
	Factory.RegisterGovern("Cargo.toml", "update", (Target, Actor, Version) =>
		Direct.Update(Factory, State, Target, Actor, Version),
	);

	// 4. Attach — the factory's lifecycle effects (P1 jobs / P2 in-flight / P5
	//    storage), labels prefixed with the module name.
	Factory.Attach(Context, { state: State, name: "hook-dsh-governor-cargo" });

	// The loader ignores any return value; the smoke harness probes the
	// per-dir in-flight/breaker maps through this debug attachment instead
	// (a bare `return State` is avoided: loader behavior on apply return
	// values is untrusted — 2026-10-03 incident).
	(Context as { __hookDshGovernorCargoState?: StateView }).__hookDshGovernorCargoState = State;
};
