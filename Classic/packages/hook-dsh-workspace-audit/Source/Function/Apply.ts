import type { Context } from "@deepseek-ai/cordis";
import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import Observe from "@Function/Observe.js";
import ServiceClass from "@Function/Service.js";
import Storage from "@Function/Storage.js";
import type Config from "@Interface/Config.js";
import type FactoryHandle from "@Interface/Factory.js";
import type State from "@Interface/State.js";
import { Proof } from "@playform/lib-dsh-core";

/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * service registration, the activation proof, the fs/observed listener and the
 * own P5-style storage effect.
 *
 * @remarks
 *
 * The State build uses the factory's cell unwrap + the P10 volatile refresh.
 * The service registration is Function/Service (`workspaceAudit`, constructed
 * here so `ctx.workspaceAudit` resolves); the fs/observed listener is the
 * factory's Wire on the ROOT context. The contract is
 * Documentation/Plans/Workspace-Family/AUDIT.md +
 * WORKSPACE-FAMILY-V4-1.md section 2 item 6.
 *
 * THE LIVE DISABLED POSTURE: `enabled` defaults to false (the schema default
 * and the bundle patch row). A cold mount logs `disabled (enabled=false)` and
 * registers EVERY surface - the fs/observed listener (the factory's Wire on
 * the ROOT context), the own P5-style storage effect and the service. Every
 * registered surface checks the flag at CALL time (the volatile cell
 * refreshed in place by the factory's P10 loader/volatile-update listener,
 * never captured at mount), so a disabled call passes through with ZERO
 * ledger lines and a volatile flip acts on the very next call in both
 * directions, with no remount.
 *
 * The function returns NOTHING (the loader contract: a returned value silently
 * kills event delivery). The test probe is the
 * `ctx.__hookDshWorkspaceAuditState` attachment.
 */
/**
 * Unwrap one possibly-volatile config cell (`{ get }` reference or value).
 */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

/**
 * The fail-loud validation (runs BEFORE the State build so an invalid config
 * throws at load, never silently defaults).
 */
const Validate = (Options: unknown): void => {
	const Raw = (Options ?? {}) as Record<string, unknown>;
	const Fail = (Message: string): never => {
		throw new Error(`audit: ${Message}`);
	};
	switch (true) {
		case typeof Cell(Raw["domain"]) !== "string" || String(Cell(Raw["domain"])).length === 0:
			Fail("domain must be a non-empty string");
			break;
		case !(
			typeof Cell(Raw["maxLines"]) === "number" &&
			Number.isInteger(Cell(Raw["maxLines"])) &&
			(Cell(Raw["maxLines"]) as number) >= 1
		):
			Fail("maxLines must be an integer >= 1");
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
		module: "audit",
		counter: true,
		fields: {
			On: "enabled",
			DomainName: "domain",
			MaxLines: "maxLines",
			Allow: "policy",
		},
	}) as State;
	State.Factory = Factory;
	State.Chains = new Map();
	State.Ring = [];
	// The declared counter (the `counter: true` setup option above births it
	// at build time): the hook's own sequence field aliases the born counter -
	// `Next` is the only way to advance, `Restore` raises and never lowers.
	State.Sequence = State.Counter as State["Sequence"];
	State.Handle = undefined;
	State.Seen = new Map();

	// The hook's OWN actor marker: an fs/observed event carrying exactly this
	// object as its actor is the hook's own (the identity check in the
	// listener) and is ignored.
	State.Self = { plugin: "hook-dsh-workspace-audit" };

	// The service is registered from apply: the Service base constructor
	// calls ctx.reflect.provide("workspaceAudit", this).
	new ServiceClass(Context, State);
	// The master switch: the ONE mount-time effect of the flag is the ledger
	// line - a disabled mount writes `disabled (enabled=false)` instead of
	// the activation proof and still registers EVERYTHING below (the
	// live-flip law: the factory refreshes State.On in place, so a flip acts
	// on the very next call in both directions, with no remount).
	Factory.Append(
		State,
		Proof(State.On !== false, [
			["domain", State.DomainName],
			["maxLines", String(State.MaxLines)],
		]),
	);

	// The fs/observed listener, on the ROOT context (the factory's Wire) -
	// the OutcomeEvidence per observed write.
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
				// Silent skip: nothing to open, nothing to close; the lines
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
	}, "audit-storage");

	// The test probe (live-containers precedent): apply returns NOTHING; the
	// state is exposed through the context attachment.
	(Context as unknown as Record<string, unknown>)["__hookDshWorkspaceAuditState"] = State;
};
