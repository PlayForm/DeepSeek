// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the service
// registration (Function/Service - `workspaceEvidence`, constructed here so
// `ctx.workspaceEvidence` resolves), the activation proof, the fs/observed
// listener (the factory's Wire on the ROOT context - the invalidation seam),
// and the own P5-style storage effect. The contract is EVIDENCE.md.
//
// THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default
// and the bundle patch row). A cold mount logs `disabled (enabled=false)`,
// registers the service (it answers honestly: a validate() fails loud with
// `evidence: service is disabled (enabled=false)`, an invalidate() finds
// nothing), and wires
// NOTHING - no listener, no storage effect, no events consumed.
//
// The function returns NOTHING (the loader contract: a returned value
// silently kills event delivery). The test probe is the
// `ctx.__pluginDshWorkspaceEvidenceState` attachment.
import type { Context } from "@deepseek-ai/cordis";
import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import ServiceClass from "@Function/Service.js";
import Storage from "@Function/Storage.js";
import Watch from "@Function/Watch.js";
import type Config from "@Interface/Config.js";
import type FactoryHandle from "@Interface/Factory.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/ets-base-dsh";

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
		throw new Error(`evidence: ${Message}`);
	};
	switch (true) {
		case typeof Cell(Raw["domain"]) !== "string" || String(Cell(Raw["domain"])).length === 0:
			Fail("domain must be a non-empty string");
			break;
		case !(
			typeof Cell(Raw["maxValidations"]) === "number" &&
			Number.isInteger(Cell(Raw["maxValidations"])) &&
			(Cell(Raw["maxValidations"]) as number) >= 1
		):
			Fail("maxValidations must be an integer >= 1");
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
		module: "evidence",
		fields: {
			On: "enabled",
			DomainName: "domain",
			MaxValidations: "maxValidations",
			Allow: "policy",
		},
	}) as State;
	State.Factory = Factory;
	State.Store = new Map();
	State.Sequence = 0;
	State.Handle = undefined;
	// The service's OWN actor marker: an fs/observed event carrying exactly
	// this object as its actor is the service's own (the identity check in
	// the listener) and is ignored.
	State.Self = { plugin: "plugin-dsh-workspace-evidence" };
	// The service is registered from apply: the Service base constructor
	// calls ctx.reflect.provide("workspaceEvidence", this).
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
	// The fs/observed listener, on the ROOT context (the factory's Wire) -
	// the invalidation seam: a changed path is an invalidation key.
	Factory.Wire(
		Context,
		State,
		(
			Target: FsTarget | undefined,
			Observation: FsObservation | undefined,
			Actor: object | undefined,
		) => Watch(State, Target, Observation, Actor),
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
				// Silent skip: nothing to open, nothing to close; the store
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
	}, "evidence-storage");
	// The test probe (live-containers precedent): apply returns NOTHING; the
	// state is exposed through the context attachment.
	(Context as unknown as Record<string, unknown>)["__pluginDshWorkspaceEvidenceState"] = State;
};
