// Apply — the plugin entry function: a THIN MODULE over the factory service
// (ctx.pluginFactory, injected — the loader holds this bundle pending until
// the factory service exists). Everything here is factory machinery; the
// module owns only its identity, its ledger strings and its observe/transform:
//
//   1. State — Furnace.State(ctx, config, { module: "hook-dsh-pinner-package", fields:
//      { Section: "sections" }, policyFileName: "pin-policy.json" }): the
//      shared shape (defensive cell unwrap of the factory's volatile shared
//      fields, Tool/Policy/Ledger/Enabled/List mappings, Stash/Inflight/
//      Seams/Queue/Journal, the P9 subprocess probe) + the pinner's Section.
//   2. The activation proof — the MODULE'S ledger strings: the durable
//      `activated (…)` Append ("did it activate" must be answerable from the
//      ledger alone) and the P5 Journal record.
//   3. Wire — the fs/observed hook (Function/Observe).
//   4. Attach — the P1 jobs-controller, P2 in-flight-disposal and P5
//      storage-domain effects, labeled `hook-dsh-pinner-package-*`.
//
// The function returns NOTHING — never a value: the loader treats apply
// return values specially, and a returned State object silently killed event
// delivery (live-verified 2026-10-03). The built State is exposed via the
// context attachment `__hookDshPinnerPackageState` for test probes (the smoke asserts the
// factory wiring through it).
//
// -- hook: fs/observed only. NEVER fs/write-intent / fs/edit-intent (the
// single-slot waterfalls belong to the observation policy; registering
// there would veto it). Never tools/* (result amendment is louder).
import Observe from "./Observe.js";
import { Pin } from "./Direct.js";
import { Activate } from "@playform/hook-dsh-core";
import type Config from "@Interface/Config.js";
import type State from "@Interface/State.js";
import type { Context } from "@deepseek-ai/cordis";

export default (Context: Context, Options: Config): void => {
	// The factory service — declared by `inject`; the accessor never throws
	// here (the loader guarantees every injected service exists).
	const Furnace = Context.pluginFactory;

	const State = Furnace.State<State>(Context, Options, {
		module: "hook-dsh-pinner-package", // doubles as the factory-composed line prefix
		fields: { Section: "sections" }, // the pinner's own field (config key)
		policyFileName: "pin-policy.json", // the union-discovery sidecar name
	});

	// The context attachment for test probes (never a return value).
	(Context as unknown as Record<string, unknown>)["__hookDshPinnerPackageState"] = State;

	// Durable activation proof (the module's own string) + the P5 journal
	// record — both flow through the factory's Append/Journal. The line's
	// string mechanics live in the core's Activate composer; the FIELD LIST
	// is the module's own — the leading bare flavor word (empty key) and the
	// bracketed lists.
	const Proof = Activate([
		["", "pinner"],
		["logFile", State.Ledger],
		["sections", `[${State.Section.join(", ")}]`],
		["exclude", `[${State.List.join(", ")}]`],
	]);
	Furnace.Append(State, Proof);
	Furnace.Journal(State, "activated", "", Proof);

	// The listener is owned by the current fiber: removed on unload — no
	// manual removeListener bookkeeping, ever (the factory's Wire).
	Furnace.Wire(Context, State, (Target, Observation, Actor) =>
		Observe(Furnace, State, Target, Observation, Actor),
	);

	// The direct-govern registration (the factory's GovernSteps registry): the
	// raw-write tool's per-call `govern` path. One step for the "package.json"
	// basename — the chain pass alone (Function/Direct.Pin). The closure
	// captures THIS apply's State, so every ledger string stays the module's
	// own, byte-identical.
	Furnace.RegisterGovern("package.json", "pin", (Target, Actor, Version) =>
		Pin(Furnace, State, Target, Actor, Version),
	);

	// The lifecycle effects: P1 jobs controller, P2 in-flight disposal, P5
	// storage domain (labels: hook-dsh-pinner-package-jobs / -inflight / -storage).
	Furnace.Attach(Context, { state: State, name: "hook-dsh-pinner-package" });
};
