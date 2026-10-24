// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the service
// registration (Function/Service - `workspaceSemantics`, constructed here so
// `ctx.workspaceSemantics` resolves), the adapter registrations (the default
// TypeScript adapter, Function/TypeScript, then the opt-in any-file adapters
// named by config `adapters`, Function/Adapters), the LSP deepener
// registration (Function/Deepen + Function/Lsp), the activation proof, the
// fs/observed listener (the factory's Wire on the ROOT context), and the own
// P5-style storage effect. The contract is SEMANTICS.md.
//
// THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default
// and the bundle patch row). A cold mount logs `disabled (enabled=false)`,
// registers the service and the adapters (it answers honestly: resolve on an
// empty index still builds through the adapter), and wires NOTHING else - no
// listener, no storage effect, no events consumed.
//
// The function returns NOTHING (the loader contract: a returned value
// silently kills event delivery). The test probe is the
// `ctx.__pluginDshWorkspaceSemanticsState` attachment.
import type { Context } from "@deepseek-ai/cordis";
import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import Adapters from "@Function/Adapters.js";
import Deepen from "@Function/Deepen.js";
import Lsp from "@Function/Lsp.js";
import Register from "@Function/Register.js";
import ServiceClass from "@Function/Service.js";
import Storage from "@Function/Storage.js";
import TypeScriptAdapter from "@Function/TypeScript.js";
import Watch from "@Function/Watch.js";
import type Adapter from "@Interface/Adapter.js";
import type Config from "@Interface/Config.js";
import type FactoryHandle from "@Interface/Factory.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/lib-dsh-core";
import Catalog from "@Variable/Adapters.js";

/** Unwrap one possibly-volatile config cell (`{ get }` reference or value). */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

/** The fail-loud validation; runs BEFORE the State build so an invalid config
 *  throws at load, never silently defaults. */
const Validate = (Options: unknown): void => {
	const Raw = (Options ?? {}) as Record<string, unknown>;
	const Fail = (Message: string): never => {
		throw new Error(`semantics: ${Message}`);
	};
	const Names = Object.keys(Catalog);
	switch (true) {
		case typeof Cell(Raw["domain"]) !== "string" || String(Cell(Raw["domain"])).length === 0:
			Fail("domain must be a non-empty string");
			break;
		case !(
			typeof Cell(Raw["maxEntries"]) === "number" &&
			Number.isInteger(Cell(Raw["maxEntries"])) &&
			(Cell(Raw["maxEntries"]) as number) >= 1
		):
			Fail("maxEntries must be an integer >= 1");
			break;
		case !Array.isArray(Cell(Raw["exclude"])):
			Fail("exclude must be an array");
			break;
		case typeof Cell(Raw["root"]) !== "string":
			Fail("root must be a string");
			break;
		case typeof Cell(Raw["lsp"]) !== "boolean":
			Fail("lsp must be a boolean");
			break;
		case !Array.isArray(Cell(Raw["adapters"])):
			Fail("adapters must be an array");
			break;
		case (Cell(Raw["adapters"]) as unknown[]).some((Name) => !Names.includes(String(Name))):
			Fail(`adapters must name known adapters (${Names.join(", ")})`);
			break;
		default:
	}
};

export default (Context: Context, Options: Config): void => {
	Validate(Options);
	const Factory = Context.pluginFactory as unknown as FactoryHandle;
	const State = Factory.State(Context, Options, {
		module: "semantics",
		fields: {
			On: "enabled",
			DomainName: "domain",
			MaxEntries: "maxEntries",
			Root: "root",
			UseLsp: "lsp",
			AdapterNames: "adapters",
			Allow: "policy",
		},
	}) as State;
	State.Factory = Factory;
	State.Fs = Context.get?.("fs");
	State.Index = new Map();
	State.Revision = 0;
	State.Adapters = new Map<string, Adapter>();
	State.Deepenings = new Map();
	State.Handle = undefined;
	// The service's OWN actor marker: an fs/observed event carrying exactly
	// this object as its actor is the service's own (the identity check in
	// the listener) and is ignored.
	State.Self = { plugin: "plugin-dsh-workspace-semantics" };
	// The adapters: the default TypeScript adapter registers itself; the
	// config `adapters` names add the opt-in any-file adapters; callers add
	// more through the service's adapt() (the any-file adapter seam).
	Register(State, TypeScriptAdapter);
	Adapters(State, State.AdapterNames);
	// The LSP deepener (the primary TypeScript reference answer): registered
	// silently (no ledger line - the adapter lines stay byte-exact), probed at
	// use time; `lsp: false` keeps the model purely lexical.
	switch (true) {
		case State.UseLsp:
			Deepen(State, Lsp);
			break;
		default:
	}
	// The service is registered from apply: the Service base constructor
	// calls ctx.reflect.provide("workspaceSemantics", this).
	new ServiceClass(Context, State);
	switch (true) {
		case !State.On:
			// The cold mount: honest in the ledger, wired to nothing.
			Factory.Append(State, "disabled (enabled=false)");
			return;
		default:
	}
	// The activation proof (the module's own composed line).
	Factory.Append(State, Activate([["domain", State.DomainName]]));
	// The fs/observed listener, on the ROOT context (the factory's Wire).
	Factory.Wire(
		Context,
		State,
		(Target: FsTarget, Observation: FsObservation, Actor: object | undefined) =>
			Watch(State, Target, Observation, Actor),
	);
	// The own P5-style storage effect: probe `storageDomain` once, open the
	// service's domain (never awaited - best-effort inside), close on dispose.
	Context.effect?.(() => {
		const Facility = Context.get?.("storageDomain");
		switch (true) {
			case !!Facility:
				void Storage(State, Facility);
				break;
			default:
				// Silent skip: nothing to open, nothing to close; the index
				// lives in memory only (honest degradation after a restart).
				return () => {};
		}
		return () => {
			const Handle = State.Handle;
			State.Handle = undefined;
			switch (true) {
				case !!Handle:
					void Handle.close().catch(() => {
						/* close best-effort */
					});
					break;
			}
		};
	}, "semantics-storage");
	// The test probe (live-containers precedent): apply returns NOTHING; the
	// state is exposed through the context attachment.
	(Context as unknown as Record<string, unknown>)["__pluginDshWorkspaceSemanticsState"] = State;
};
