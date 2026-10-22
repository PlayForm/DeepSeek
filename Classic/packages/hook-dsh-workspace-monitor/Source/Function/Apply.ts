// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the activation
// proof, the fs/observed listener (the factory's Wire on the ROOT context).
// The contract is Documentation/Plans/Workspace-Family/MONITOR.md.
//
// THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default
// and the bundle patch row). A cold mount logs `disabled (enabled=false)`
// and wires NOTHING - no listener, no watch state, no events consumed.
//
// The function returns NOTHING (the loader contract: a returned value
// silently kills event delivery). The test probe is the
// `ctx.__hookDshWorkspaceMonitorState` attachment.
import type { Context } from "@deepseek-ai/cordis";
import Watch from "@Function/Watch.js";
import type Config from "@Interface/Config.js";
import type FactoryHandle from "@Interface/Factory.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/lib-dsh-core";

/** Unwrap one possibly-volatile config cell (`{ get }` reference or value). */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

/** The fail-loud validation; runs BEFORE the State build so an invalid
 * config throws at load, never silently defaults. */
const Validate = (Options: unknown): void => {
	const Raw = (Options ?? {}) as Record<string, unknown>;
	const Fail = (Message: string): never => {
		throw new Error(`monitor: ${Message}`);
	};
	const Positive = (Key: string): boolean =>
		typeof Cell(Raw[Key]) === "number" &&
		Number.isInteger(Cell(Raw[Key])) &&
		(Cell(Raw[Key]) as number) >= 0;
	switch (true) {
		case typeof Cell(Raw["domain"]) !== "string" || String(Cell(Raw["domain"])).length === 0:
			Fail("domain must be a non-empty string");
			break;
		case !(Positive("debounceMs") && Positive("sweepIntervalMs")):
			Fail("debounceMs and sweepIntervalMs must be integers >= 0");
			break;
		case !(Positive("maxWatch") && (Cell(Raw["maxWatch"]) as number) >= 1):
			Fail("maxWatch must be an integer >= 1");
			break;
		case !(Array.isArray(Cell(Raw["include"])) && Array.isArray(Cell(Raw["exclude"]))):
			Fail("include and exclude must be arrays");
			break;
		case Cell(Raw["checksets"]) !== null && typeof Cell(Raw["checksets"]) !== "object":
			Fail("checksets must be an object");
			break;
		default:
	}
};

export default (Context: Context, Options: Config): void => {
	Validate(Options);
	const Factory = Context.pluginFactory as unknown as FactoryHandle;
	const State = Factory.State(Context, Options, {
		module: "monitor",
		fields: {
			On: "enabled",
			DomainName: "domain",
			DebounceMs: "debounceMs",
			SweepIntervalMs: "sweepIntervalMs",
			MaxWatch: "maxWatch",
			Include: "include",
			CheckSets: "checksets",
		},
	}) as State;
	State.Factory = Factory;
	State.Watch = new Map();
	State.Events = 0;
	State.Sweeps = 0;
	State.LastSweepAt = undefined;
	// The hook's OWN actor marker: an fs/observed event carrying exactly this
	// object as its actor is the hook's own (the identity check in the
	// listener) and is ignored.
	State.Self = { plugin: "hook-dsh-workspace-monitor" };
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
			["checksets", String(Object.keys(State.CheckSets ?? {}).length)],
		]),
	);
	// The fs/observed listener, on the ROOT context (the factory's Wire).
	Factory.Wire(Context, State, (Target, Observation, Actor) =>
		Watch(State, Target, Observation, Actor),
	);
	// The test probe (live-containers precedent): apply returns NOTHING; the
	// state is exposed through the context attachment.
	(Context as unknown as Record<string, unknown>)["__hookDshWorkspaceMonitorState"] = State;
};
