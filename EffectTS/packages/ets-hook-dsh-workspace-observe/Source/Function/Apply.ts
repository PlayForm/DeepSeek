import type { Context } from "@deepseek-ai/cordis";
import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import Observe from "@Function/Observe.js";
import ServiceClass from "@Function/Service.js";
import Storage from "@Function/Storage.js";
import type Config from "@Interface/Config.js";
import type State from "@Interface/State.js";
import { Proof } from "@playform/ets-base-dsh";

/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * service registration, the activation proof, the fs/observed listener and
 * the own P5-style storage effect.
 *
 * @remarks
 *
 * The service (Function/Service - `workspaceObserve`) is constructed here so
 * `ctx.workspaceObserve` resolves. The contract is WAVE-1-BRIEF.md section
 * 5.
 *
 * THE LIVE DISABLED POSTURE: `enabled` defaults to false (the schema default
 * and the bundle patch row). A cold mount logs
 * `disabled (enabled=false)` and registers EVERY surface - the fs/observed
 * listener (the factory's Wire), the own P5-style storage effect and the
 * service (it reads honestly from the empty state).
 *
 * The function returns NOTHING (the loader contract: a returned value
 * silently kills event delivery). The test probe is the
 * `ctx.__hookDshWorkspaceObserveState` attachment.
 */
/**
 * Unwrap one possibly-volatile config cell (a `{ get }` reference or value).
 */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

/**
 * The fail-loud validation (the brief's section 5.6; runs BEFORE the State
 * build so an invalid config throws at load, never silently defaults).
 */
const Validate = (Options: unknown): void => {
	const Raw = (Options ?? {}) as Record<string, unknown>;
	const Fail = (Message: string): never => {
		throw new Error(`observe: ${Message}`);
	};
	switch (true) {
		case typeof Cell(Raw["domain"]) !== "string" || String(Cell(Raw["domain"])).length === 0:
			Fail("domain must be a non-empty string");
			break;
		case !(
			typeof Cell(Raw["maxStamps"]) === "number" &&
			Number.isInteger(Cell(Raw["maxStamps"])) &&
			(Cell(Raw["maxStamps"]) as number) >= 1
		):
			Fail("maxStamps must be an integer >= 1");
			break;
		case !(Array.isArray(Cell(Raw["include"])) && Array.isArray(Cell(Raw["exclude"]))):
			Fail("include and exclude must be arrays");
			break;
		default:
	}
};

export default (Context: Context, Options: Config): void => {
	Validate(Options);
	const Factory = Context.pluginFactory;
	const State = Factory.State(Context, Options, {
		module: "observe",
		fields: {
			On: "enabled",
			DomainName: "domain",
			MaxStamps: "maxStamps",
			Include: "include",
			Allow: "policy",
		},
	}) as State;
	State.Factory = Factory;
	State.Latest = new Map();
	State.Ring = [];
	State.Sequence = 0;
	State.Handle = undefined;
	State.Seen = new Map();

	// The hook's OWN actor marker: an fs/observed event carrying exactly this
	// object as its actor is the hook's own (the identity check in the
	// listener) and is ignored.
	State.Self = { plugin: "hook-dsh-workspace-observe" };

	// The service is registered from apply: the Service base constructor
	// calls ctx.reflect.provide("workspaceObserve", this).
	new ServiceClass(Context, State);
	// The master switch: the ONE mount-time effect of the flag is the ledger
	// line - a disabled mount writes `disabled (enabled=false)` instead of
	// the activation proof and still registers EVERYTHING below (the
	// live-flip law: the factory refreshes State.On in place, so a flip acts
	// on the very next call in both directions, with no remount).
	Factory.Append(State, Proof(State.On !== false, [["domain", State.DomainName]]));

	// The fs/observed listener, on the ROOT context (the factory's Wire).
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
				// Silent skip: nothing to open, nothing to close; the stamps
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
	}, "observe-storage");

	// The test probe (live-containers precedent): apply returns NOTHING; the
	// state is exposed through the context attachment.
	(Context as unknown as Record<string, unknown>)["__hookDshWorkspaceObserveState"] = State;
};
