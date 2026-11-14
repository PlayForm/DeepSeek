import type { Context } from "@deepseek-ai/cordis";
import Observe from "@Function/Observe.js";
import ServiceClass from "@Function/Service.js";
import Storage from "@Function/Storage.js";
import * as Tools from "@Function/Tools.js";
import Validate from "@Function/Validate.js";
import type Config from "@Interface/Config.js";
import type FactoryHandle from "@Interface/Factory.js";
import type State from "@Interface/State.js";
import { Proof } from "@playform/lib-dsh-core";

/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * service registration, the activation proof, the fence tracker, the two
 * tools, and the own storage effect.
 *
 * @remarks
 *
 * The State build uses the factory's cell unwrap + the P10 volatile refresh.
 * The service registration is Function/Service (`workspaceOperate`,
 * constructed here so `ctx.workspaceOperate` resolves). The fence tracker is
 * the factory's Wire on the ROOT context (the staleness rule's data source,
 * silent by design). The two tools are workspace_propose +
 * workspace_proposals, registered per the family's
 * tools-live-in-their-owning-hook law. The storage effect is the own
 * P5-style one. The contract is
 * Documentation/Plans/Workspace-Family/OPERATE.md.
 *
 * THE LIVE DISABLED POSTURE: `enabled` defaults to false (the schema default
 * and the bundle patch row). A cold mount logs
 * `disabled (enabled=false)` and registers EVERY surface - the fs/observed
 * fence tracker, the two tools and the storage effect, beside the service.
 * Every registered surface checks the flag at CALL time (the volatile cell
 * refreshed in place by the factory's P10 loader/volatile-update listener,
 * never captured at mount): a disabled fence tracker stays silent, a
 * disabled propose refuses with the typed `disabled` refusal and ZERO
 * ledger lines (Function/Propose), and a volatile flip acts on the very
 * next call in both directions, with no remount.
 *
 * The function returns NOTHING (the loader contract: a returned value
 * silently kills event delivery). The test probe is the
 * `ctx.__hookDshWorkspaceOperateState` attachment.
 */
export default (Context: Context, Options: Config): void => {
	Validate(Options);
	const Factory = Context.pluginFactory as unknown as FactoryHandle;
	const State = Factory.State(Context, Options, {
		module: "operate",
		counter: true,
		fields: {
			On: "enabled",
			DomainName: "domain",
			MaxProposals: "maxProposals",
			LimitDefault: "limitDefault",
			LimitMaximum: "limitMaximum",
			Allow: "policy",
		},
	}) as State;
	State.Factory = Factory;
	State.Proposals = new Map();
	// The declared counter (the `counter: true` setup option above births it
	// at build time): the hook's own sequence field aliases the born counter -
	// `Next` is the only way to advance, `Restore` raises and never lowers.
	State.Sequence = State.Counter as State["Sequence"];
	State.Refused = 0;
	State.Observed = new Map();
	State.Graph = undefined;
	State.Handle = undefined;
	State.Self = { plugin: "hook-dsh-workspace-operate" };

	// The service is registered from apply: the Service base constructor
	// calls ctx.reflect.provide("workspaceOperate", this).
	new ServiceClass(Context, State);
	// The master switch: the ONE mount-time effect of the flag is the ledger
	// line - a disabled mount writes `disabled (enabled=false)` instead of
	// the activation proof and still registers EVERYTHING below (the
	// live-flip law: the factory refreshes State.On in place, so a flip acts
	// on the very next call in both directions, with no remount).
	Factory.Append(State, Proof(State.On !== false, [["domain", State.DomainName]]));

	// The fs/observed fence tracker, on the ROOT context (the factory's
	// Wire) - silent by design, the staleness rule's data source.
	Factory.Wire(Context, State, (Target, Observation, Actor) =>
		Observe(State, Target, Observation, Actor),
	);

	// The two tools (the probe keeps the POC self-contained: the tools
	// service is a host facility, not a sibling package).
	const Host = Context.get?.("tools") as
		{ register?: (definition: unknown) => () => void } | undefined;
	if (typeof Host?.register === "function") {
		Host.register(Tools.ProposeTool(State));
		Host.register(Tools.ProposalsTool(State));
	}
	// The own P5-style storage effect: probe `storageDomain` once, open the
	// hook's domain (never awaited - best-effort inside), close on dispose.
	Context.effect?.(() => {
		const Facility = Context.get?.("storageDomain");
		switch (true) {
			case !!Facility:
				void Storage(State, Facility);
				break;
			default:
				// Silent skip: nothing to open, nothing to close; the proposals
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
	}, "operate-storage");

	// The test probe (live-containers precedent): apply returns NOTHING; the
	// state is exposed through the context attachment.
	(Context as unknown as Record<string, unknown>)["__hookDshWorkspaceOperateState"] = State;
};
