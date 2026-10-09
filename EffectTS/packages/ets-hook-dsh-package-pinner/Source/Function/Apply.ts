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
//
// THE EFFECT DELTA (R4, mirroring the R3 governor pattern): the plugin's
// long-lived Effect `Scope` is created synchronously right after the State
// (`State.Scope = Effect.runSync(Scope.make())` — apply is a sync seam, and a
// sync `Scope.make` run through `Effect.runSync` is fully synchronous, so no
// async boundary is introduced). THE PINNER HAS NO UPDATE STAGE — it never
// uses the core's typed-effect Update envelope (no Dispatch/Settle; its only
// core imports are the plain composers Activate / Suppress / Refusal) and its
// pin chain runs as the FACTORY'S detached contained continuation (the
// factory's own Effect runtime: the `dsh.chain-pass` span, the WriteService,
// the `Effect.ensuring` P2 finalizer) — so, unlike the governor, no
// `Scope.provide` call site consumes the scope and NO module span is added
// here (the R2/R3 style puts spans on typed-effect boundaries only; the
// direct pin step is a Continue consumer exactly like the governor's
// Canonicalize, which carries none either). The field exists for the family's
// uniform State shape and for any future Effect-native stage, which would
// adopt it via `Scope.provide`. The loader does not close it — the pinner's
// disposal semantics stay the Classic ones (the P2 Inflight abort kills any
// in-flight pass's controller; the factory's Attach effect owns that).
import { Effect, Scope } from "effect";
import Observe from "./Observe.js";
import { Pin } from "./Direct.js";
import { Activate } from "@playform/ets-dsh-hook";
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

	// THE EFFECT DELTA (R4, see the header): the family's uniform fiber home —
	// a synchronous `Scope.make` (apply is a sync seam). Unused at runtime by
	// this module (no typed-effect stage), but always present so the State
	// shape matches the R3 governor pattern.
	State.Scope = Effect.runSync(Scope.make());

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
