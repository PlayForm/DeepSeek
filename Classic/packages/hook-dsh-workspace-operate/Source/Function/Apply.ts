// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the service
// registration (Function/Service - `workspaceOperate`, constructed here so
// `ctx.workspaceOperate` resolves), the activation proof, the fs/observed
// fence tracker (the factory's Wire on the ROOT context - the staleness
// rule's data source, silent by design), the two tools (workspace_propose +
// workspace_proposals, registered per the family's tools-live-in-their-
// owning-hook law), and the own P5-style storage effect. The contract is
// Documentation/Plans/Workspace-Family/OPERATE.md.
//
// THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default
// and the bundle patch row). A cold mount logs
// `disabled (enabled=false)`, registers the service (it reads honestly from
// the empty state), and wires NOTHING - no listener, no storage effect, no
// tools.
//
// The function returns NOTHING (the loader contract: a returned value
// silently kills event delivery). The test probe is the
// `ctx.__hookDshWorkspaceOperateState` attachment.
import type { Context } from "@deepseek-ai/cordis";
import Observe from "@Function/Observe.js";
import ServiceClass from "@Function/Service.js";
import Storage from "@Function/Storage.js";
import * as Tools from "@Function/Tools.js";
import Validate from "@Function/Validate.js";
import type Config from "@Interface/Config.js";
import type FactoryHandle from "@Interface/Factory.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/lib-dsh-core";

export default (Context: Context, Options: Config): void => {
	Validate(Options);
	const Factory = Context.pluginFactory as unknown as FactoryHandle;
	const State = Factory.State(Context, Options, {
		module: "operate",
		fields: {
			On: "enabled",
			DomainName: "domain",
			MaxProposals: "maxProposals",
			LimitDefault: "limitDefault",
			LimitMaximum: "limitMaximum",
		},
	}) as State;
	State.Factory = Factory;
	State.Proposals = new Map();
	State.Sequence = 0;
	State.Refused = 0;
	State.Observed = new Map();
	State.Graph = undefined;
	State.Handle = undefined;
	State.Self = { plugin: "hook-dsh-workspace-operate" };
	// The service is registered from apply: the Service base constructor
	// calls ctx.reflect.provide("workspaceOperate", this).
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
	// The fs/observed fence tracker, on the ROOT context (the factory's
	// Wire) - silent by design, the staleness rule's data source.
	Factory.Wire(Context, State, (Target, Observation, Actor) =>
		Observe(State, Target, Observation, Actor),
	);
	// The two tools (the probe keeps the POC self-contained: the tools
	// service is a host facility, not a sibling package).
	const Host = Context as unknown as {
		tools?: { register?: (definition: unknown) => () => void };
	};
	if (typeof Host.tools?.register === "function") {
		Host.tools.register(Tools.ProposeTool(State));
		Host.tools.register(Tools.ProposalsTool(State));
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
