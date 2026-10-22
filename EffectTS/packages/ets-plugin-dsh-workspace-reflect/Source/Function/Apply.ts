// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the service
// registration (Function/Service - `workspaceReflect`, constructed here so
// `ctx.workspaceReflect` resolves), and the activation proof. The contract
// is REFLECT.md (the later stage).
//
// THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default
// and the bundle patch row). A cold mount logs `disabled (enabled=false)`
// and registers the service - every operation then answers `denied` with its
// own ledger line, never a silent failure and never a write.
//
// There is NO listener and NO storage effect: the reflective ops are
// request/response transformations over explicit service calls; their durable
// record is the ledger file (one log per module), and the graph carry keeps
// the representation current after each applied write.
//
// The function returns NOTHING (the loader contract: a returned value
// silently kills event delivery). The test probe is the
// `ctx.__pluginDshWorkspaceReflectState` attachment.
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

/** The fail-loud validation (the schema's contract; runs BEFORE the State
 *  build so an invalid config throws at load, never silently defaults). */
const Validate = (Options: unknown): void => {
	const Raw = (Options ?? {}) as Record<string, unknown>;
	const Fail = (Message: string): never => {
		throw new Error(`reflect: ${Message}`);
	};
	switch (true) {
		case Cell(Raw["propagate"]) !== "block" && Cell(Raw["propagate"]) !== "file":
			Fail('propagate must be "block" or "file"');
			break;
		case !(
			typeof Cell(Raw["maxFileBytes"]) === "number" &&
			Number.isInteger(Cell(Raw["maxFileBytes"])) &&
			(Cell(Raw["maxFileBytes"]) as number) >= 1
		):
			Fail("maxFileBytes must be an integer >= 1");
			break;
		case !(
			typeof Cell(Raw["maxBlockLines"]) === "number" &&
			Number.isInteger(Cell(Raw["maxBlockLines"])) &&
			(Cell(Raw["maxBlockLines"]) as number) >= 1
		):
			Fail("maxBlockLines must be an integer >= 1");
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
		module: "reflect",
		fields: {
			On: "enabled",
			Propagate: "propagate",
			MaxFileBytes: "maxFileBytes",
			MaxBlockLines: "maxBlockLines",
		},
	}) as State;
	State.Factory = Factory;
	// The service is registered from apply: the Service base constructor
	// calls ctx.reflect.provide("workspaceReflect", this).
	new ServiceClass(Context, State);
	switch (true) {
		case !State.On:
			// The cold mount: honest in the ledger, wired to nothing.
			Factory.Append(State, "disabled (enabled=false)");
			return;
		default:
	}
	// The activation proof (the module's own composed line).
	Factory.Append(State, Activate([["propagate", State.Propagate]]));
	// The test probe (live-containers precedent): apply returns NOTHING; the
	// state is exposed through the context attachment.
	(Context as unknown as Record<string, unknown>)["__pluginDshWorkspaceReflectState"] = State;
};
