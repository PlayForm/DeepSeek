// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the service
// registration (Function/Service - `workspaceJournal`, constructed here so
// `ctx.workspaceJournal` resolves), the activation proof, the fs/observed
// listener (the factory's Wire on the ROOT context), the own P5-style
// storage effect, and the boot recovery pass. The contract is
// Documentation/Plans/Workspace-Family/JOURNAL.md + WORKSPACE-FAMILY-V4-1.md
// sections 3.7-3.8.
//
// THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default
// and the bundle patch row). A cold mount logs
// `disabled (enabled=false)`, registers the service (it reads honestly from
// the empty state), and wires NOTHING - no listener, no storage effect, no
// recovery pass.
//
// The function returns NOTHING (the loader contract: a returned value
// silently kills event delivery). The test probe is the
// `ctx.__hookDshWorkspaceJournalState` attachment.
import type { Context } from "@deepseek-ai/cordis";
import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import Observe from "@Function/Observe.js";
import ServiceClass from "@Function/Service.js";
import Storage from "@Function/Storage.js";
import type Config from "@Interface/Config.js";
import type FactoryHandle from "@Interface/Factory.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/lib-dsh-core";

/** Unwrap one possibly-volatile config cell (`{ get }` reference or value). */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

/** The fail-loud validation (runs BEFORE the State build so an invalid
 * config throws at load, never silently defaults). */
const Validate = (Options: unknown): void => {
	const Raw = (Options ?? {}) as Record<string, unknown>;
	const Fail = (Message: string): never => {
		throw new Error(`journal: ${Message}`);
	};
	switch (true) {
		case typeof Cell(Raw["domain"]) !== "string" || String(Cell(Raw["domain"])).length === 0:
			Fail("domain must be a non-empty string");
			break;
		case !(
			typeof Cell(Raw["maxBatches"]) === "number" &&
			Number.isInteger(Cell(Raw["maxBatches"])) &&
			(Cell(Raw["maxBatches"]) as number) >= 1
		):
			Fail("maxBatches must be an integer >= 1");
			break;
		case !(
			typeof Cell(Raw["maxEntryBytes"]) === "number" &&
			Number.isInteger(Cell(Raw["maxEntryBytes"])) &&
			(Cell(Raw["maxEntryBytes"]) as number) >= 1
		):
			Fail("maxEntryBytes must be an integer >= 1");
			break;
		case !Array.isArray(Cell(Raw["exclude"])):
			Fail("exclude must be an array");
			break;
		default:
	}
};

export default (Context: Context, Options: Config): void => {
	Validate(Options);
	const Factory = Context.pluginFactory as unknown as FactoryHandle;
	const State = Factory.State(Context, Options, {
		module: "journal",
		fields: {
			On: "enabled",
			DomainName: "domain",
			MaxBatches: "maxBatches",
			MaxEntryBytes: "maxEntryBytes",
		},
	}) as State;
	State.Factory = Factory;
	State.Batches = new Map();
	State.Entries = new Map();
	State.Ring = [];
	State.Handle = undefined;
	// The hook's OWN actor marker: an fs/observed event carrying exactly this
	// object as its actor is the hook's own (the identity check in the
	// listener) and is ignored.
	State.Self = { plugin: "hook-dsh-workspace-journal" };
	// The service is registered from apply: the Service base constructor
	// calls ctx.reflect.provide("workspaceJournal", this).
	new ServiceClass(Context, State);
	switch (true) {
		case !State.On:
			// The cold mount: honest in the ledger, wired to nothing.
			Factory.Append(State, "disabled (enabled=false)");
			return;
		default:
	}
	// The activation proof (the module's own composed line).
	Factory.Append(
		State,
		Activate([
			["domain", State.DomainName],
			["maxBatches", String(State.MaxBatches)],
		]),
	);
	// The fs/observed listener, on the ROOT context (the factory's Wire) -
	// the recovery checkpoint for open batches.
	Factory.Wire(
		Context,
		State,
		(Target: FsTarget, Observation: FsObservation, Actor: object | undefined) =>
			Observe(State, Target, Observation, Actor),
	);
	// The own P5-style storage effect: probe `storageDomain` once, open the
	// hook's domain (never awaited - best-effort inside), close on dispose.
	Context.effect?.(() => {
		const Facility = Context.get?.("storageDomain");
		switch (true) {
			case !!Facility:
				void Storage(State, Facility);
				break;
			default:
				// Silent skip: nothing to open, nothing to close; the batches
				// live in memory only (honest degradation after a restart).
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
	}, "journal-storage");
	// The boot recovery pass: mark batches still `applying` at mount as
	// recovery-required (the honest all-or-nothing). Queued as a microtask
	// so it runs after the storage open's first tick had a chance.
	queueMicrotask(() => {
		const Service = (Context as unknown as Record<string, unknown>)["workspaceJournal"] as
			{ recover(): Promise<unknown> } | undefined;
		void Service?.recover();
	});
	// The test probe (live-containers precedent): apply returns NOTHING; the
	// state is exposed through the context attachment.
	(Context as unknown as Record<string, unknown>)["__hookDshWorkspaceJournalState"] = State;
};
