// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the service
// registration (Function/Service - `workspaceAuthority`), and the activation
// proof.
//
// THE IDLE-FOREVER POSTURE: `enabled` defaults to false. A cold mount logs
// `disabled (enabled=false)`; the service still registers (it reads honestly
// from the empty state) but grants, leases and evictions are refused with a
// byte-stable `refused ... (the authority is disabled)` line until enabled.
//
// The function returns NOTHING (the loader contract). The test probe is the
// `ctx.__PluginDshWorkspaceAuthorityState` attachment.
import type { Context } from "@deepseek-ai/cordis";
import ServiceClass from "@Function/Service.js";
import type Config from "@Interface/Config.js";
import type FactoryHandle from "@Interface/Factory.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/ets-base-dsh";

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
		throw new Error(`authority: ${Message}`);
	};
	switch (true) {
		case !(
			typeof Cell(Raw["defaultTtlMs"]) === "number" &&
			(Cell(Raw["defaultTtlMs"]) as number) >= 1
		):
			Fail("defaultTtlMs must be >= 1");
			break;
		case !(
			typeof Cell(Raw["maxLeasesPerHolder"]) === "number" &&
			(Cell(Raw["maxLeasesPerHolder"]) as number) >= 1
		):
			Fail("maxLeasesPerHolder must be >= 1");
			break;
		case !(
			typeof Cell(Raw["maxCapabilitiesPerHolder"]) === "number" &&
			(Cell(Raw["maxCapabilitiesPerHolder"]) as number) >= 1
		):
			Fail("maxCapabilitiesPerHolder must be >= 1");
			break;
		case !(
			typeof Cell(Raw["revocationGraceMs"]) === "number" &&
			(Cell(Raw["revocationGraceMs"]) as number) >= 0
		):
			Fail("revocationGraceMs must be >= 0");
			break;
		case !Array.isArray(Cell(Raw["policy"])):
			Fail("policy must be an array of rules");
			break;
		case !(Cell(Raw["policy"]) as { disposition?: unknown }[]).every(
			(Rule) =>
				Rule !== null &&
				typeof Rule === "object" &&
				typeof Rule.disposition === "string" &&
				["keep", "defer", "evict", "discard", "promote"].includes(Rule.disposition),
		):
			Fail("every policy rule needs disposition ∈ {keep, defer, evict, discard, promote}");
			break;
		default:
	}
};

export default (Context: Context, Options: Config): void => {
	Validate(Options);
	const Factory = Context.pluginFactory as unknown as FactoryHandle;
	const State = Factory.State(Context, Options, {
		module: "authority",
		fields: {
			On: "enabled",
			DefaultTtlMs: "defaultTtlMs",
			MaxLeases: "maxLeasesPerHolder",
			MaxCapabilities: "maxCapabilitiesPerHolder",
			RevocationGraceMs: "revocationGraceMs",
			PolicyRules: "policy",
		},
	}) as State;
	State.Factory = Factory;
	State.Capabilities = new Map();
	State.Leases = new Map();
	State.Residency = new Map();
	State.Graveyard = new Map();
	State.Sequence = 0;
	// The service is registered from apply: the Service base constructor
	// calls ctx.reflect.provide("workspaceAuthority", this).
	new ServiceClass(Context, State);
	switch (true) {
		case !State.On:
			// The cold mount: honest in the ledger, serving nothing.
			Factory.Append(State, "disabled (enabled=false)");
			break;
		default:
			// The activation proof (the module's own composed line).
			Factory.Append(
				State,
				Activate([
					["ttl", String(State.DefaultTtlMs)],
					["policy", String(State.PolicyRules.length)],
				]),
			);
	}
	// The test probe (live-containers precedent): apply returns NOTHING; the
	// state is exposed through the context attachment.
	(Context as unknown as Record<string, unknown>)["__PluginDshWorkspaceAuthorityState"] = State;
};
