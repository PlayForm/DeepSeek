// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the service
// registration (Function/Service - `workspaceApprove`, constructed here so
// `ctx.workspaceApprove` resolves), the activation proof, the fs/observed
// listener (the factory's Wire on the ROOT context), and the own P5-style
// storage effect. The contract is APPROVE.md.
//
// THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default
// and the bundle patch row). A cold mount logs `disabled (enabled=false)`,
// registers the service (it reads honestly from the empty state), and wires
// NOTHING - no listener, no storage effect, no events consumed.
//
// The function returns NOTHING (the loader contract: a returned value
// silently kills event delivery). The test probe is the
// `ctx.__hookDshWorkspaceApproveState` attachment.
import type { Context } from "@deepseek-ai/cordis";
import Invalidate from "@Function/Invalidate.js";
import ServiceClass from "@Function/Service.js";
import Storage from "@Function/Storage.js";
import type Config from "@Interface/Config.js";
import type FactoryHandle from "@Interface/Factory.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/ets-base-dsh";

/** Unwrap one possibly-volatile config cell (`{ get }` reference or value). */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

/** The fail-loud validation (the schema's contract; runs BEFORE the State
 *  build so an invalid config throws at load, never silently defaults). */
const Validate = (Options: unknown): void => {
	const Raw = (Options ?? {}) as Record<string, unknown>;
	const Fail = (Message: string): never => {
		throw new Error(`approve: ${Message}`);
	};
	switch (true) {
		case typeof Cell(Raw["domain"]) !== "string" || String(Cell(Raw["domain"])).length === 0:
			Fail("domain must be a non-empty string");
			break;
		case !(
			typeof Cell(Raw["maxBindings"]) === "number" &&
			Number.isInteger(Cell(Raw["maxBindings"])) &&
			(Cell(Raw["maxBindings"]) as number) >= 1
		):
			Fail("maxBindings must be an integer >= 1");
			break;
		case typeof Cell(Raw["requireConstraints"]) !== "boolean":
			Fail("requireConstraints must be a boolean");
			break;
		default:
	}
};

export default (Context: Context, Options: Config): void => {
	Validate(Options);
	const Factory = (
		Context as unknown as {
			pluginFactory: FactoryHandle;
		}
	).pluginFactory;
	const State = Factory.State(Context, Options, {
		module: "approve",
		fields: {
			On: "enabled",
			DomainName: "domain",
			MaxBindings: "maxBindings",
			RequireConstraints: "requireConstraints",
		},
	}) as State;
	State.Factory = Factory;
	State.ById = new Map();
	State.Ring = [];
	State.Sequence = 0;
	State.Handle = undefined;
	// The hook's OWN actor marker: an fs/observed event carrying exactly this
	// object as its actor is the hook's own (the identity check in the
	// listener) and is ignored.
	State.Self = { plugin: "hook-dsh-workspace-approve" };
	// The service is registered from apply: the Service base constructor
	// calls ctx.reflect.provide("workspaceApprove", this).
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
	// The fs/observed listener, on the ROOT context (the factory's Wire): it
	// invalidates bindings whose file moved under the approval.
	Factory.Wire(
		Context,
		State,
		(Target: unknown, Observation: unknown, Actor: object | undefined) =>
			Invalidate(State, Target, Observation, Actor),
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
				// Silent skip: nothing to open, nothing to close; the bindings
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
	}, "approve-storage");
	// The test probe (live-containers precedent): apply returns NOTHING; the
	// state is exposed through the context attachment.
	(Context as unknown as Record<string, unknown>)["__hookDshWorkspaceApproveState"] = State;
};
