// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the service
// registration (Function/Service - `batchstate`, constructed here so
// `ctx.batchstate` resolves), the activation proof, and the state-file
// recovery (Function/Recover - the plan's file-based fallback, restored
// once on mount). The contract is BATCH-STATE-PLUGIN.md sections 2 and 7.
//
// THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default
// and the bundle patch row). A cold mount logs `disabled (enabled=false)`,
// registers the service (it reads honestly from the empty state), and wires
// NOTHING - no listener, no event, no state file.
//
// The function returns NOTHING (the loader contract: a returned value
// silently kills event delivery). The test probe is the
// `ctx.__pluginDshBatchstateState` attachment.
import type { Context } from "@deepseek-ai/cordis";
import Recover from "@Function/Recover.js";
import ServiceClass from "@Function/Service.js";
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
		throw new Error(`batchstate: ${Message}`);
	};
	switch (true) {
		case typeof Cell(Raw["stateFile"]) !== "string" ||
			String(Cell(Raw["stateFile"])).length === 0:
			Fail("stateFile must be a non-empty string");
			break;
		case !(
			typeof Cell(Raw["maxRecent"]) === "number" &&
			Number.isInteger(Cell(Raw["maxRecent"])) &&
			(Cell(Raw["maxRecent"]) as number) >= 1
		):
			Fail("maxRecent must be an integer >= 1");
			break;
		case typeof Cell(Raw["batch"]) !== "string" || String(Cell(Raw["batch"])).length === 0:
			Fail("batch must be a non-empty string");
			break;
		default:
	}
};

export default (Context: Context, Options: Config): void => {
	Validate(Options);
	const Factory = Context.pluginFactory as unknown as FactoryHandle;
	const State = Factory.State(Context, Options, {
		module: "batchstate",
		fields: {
			On: "enabled",
			Batch: "batch",
			StateFile: "stateFile",
			MaxRecent: "maxRecent",
		},
	}) as State;
	State.Factory = Factory;
	// The live collections: the members map, the idle queue, the completions
	// ring (the State builder creates the shared machinery only - the
	// module's own collections start empty and are repopulated by Recover).
	State.Members = new Map();
	State.IdleQueue = [];
	State.Recent = [];
	// The service is registered from apply: the Service base constructor
	// calls ctx.reflect.provide("batchstate", this).
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
			["batch", State.Batch],
			["stateFile", State.StateFile],
		]),
	);
	// The file-based fallback (the plan's exploration item 1): recover the
	// members and the queue from the well-known JSON state file. A missing
	// or corrupt file starts the batch EMPTY - the state file is the durable
	// record; the live truth is rebuilt by the write API, never guessed.
	Recover(State);
	// The test probe (live-containers precedent): apply returns NOTHING; the
	// state is exposed through the context attachment.
	(Context as unknown as Record<string, unknown>)["__pluginDshBatchstateState"] = State;
};
