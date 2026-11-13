import type { Context } from "@deepseek-ai/cordis";
import ServiceClass from "@Function/Service.js";
import Tool from "@Function/Tool.js";
import type Config from "@Interface/Config.js";
import type FactoryHandle from "@Interface/Factory.js";
import type State from "@Interface/State.js";
import { Proof } from "@playform/lib-dsh-core";

import Adapter from "../Trace/Adapter.js";

/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * service registration, the activation proof, the trace adapter, the tool
 * registration, and the optional token-meter probe.
 *
 * @remarks
 *
 * The State build is the factory's cell unwrap + the P10 volatile refresh.
 * The service registration is Function/Service (`workspaceContext`,
 * constructed here so `ctx.workspaceContext` resolves). The trace adapter
 * consumes `graph/invalidated` to invalidate the packet memo - registered on
 * every mount, answering at call time. The token-meter probe is V4-1
 * section 4: the orientation budget uses ctx.tokenMeter where available.
 *
 * THE LIVE DISABLED POSTURE: `enabled` defaults to false (the schema default
 * and the bundle patch row). A cold mount logs `disabled (enabled=false)` and
 * registers EVERY surface - the service (it answers honestly from whatever
 * the graph provides), the trace adapter and the tool - and every one of them
 * checks State.On at CALL time, so a flip acts on the very next call without
 * a remount. The disabled tool refuses with
 * `workspace_context: the context plugin is disabled (enabled=false)` and
 * writes no ledger line.
 *
 * The function returns NOTHING (the loader contract: a returned value
 * silently kills event delivery). The test probe is the
 * `ctx.__pluginDshWorkspaceContextState` attachment.
 */
/**
 * Unwrap one possibly-volatile config cell (`{ get }` reference or value).
 */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

/**
 * The fail-loud validation; runs BEFORE the State build so an invalid
 * config throws at load, never silently defaults.
 */
const Validate = (Options: unknown): void => {
	const Raw = (Options ?? {}) as Record<string, unknown>;
	const Fail = (Message: string): never => {
		throw new Error(`context: ${Message}`);
	};
	const Positive = (Key: string, Minimum: number): boolean =>
		typeof Cell(Raw[Key]) === "number" &&
		Number.isInteger(Cell(Raw[Key])) &&
		(Cell(Raw[Key]) as number) >= Minimum;
	switch (true) {
		case typeof Cell(Raw["workspaceName"]) !== "string" ||
			String(Cell(Raw["workspaceName"])).length === 0:
			Fail("workspaceName must be a non-empty string");
			break;
		case !Positive("budgetTokens", 1) || !Positive("budgetMaximum", 1):
			Fail("budgetTokens and budgetMaximum must be integers >= 1");
			break;
		case (Cell(Raw["budgetMaximum"]) as number) < (Cell(Raw["budgetTokens"]) as number):
			Fail("budgetMaximum must be >= budgetTokens");
			break;
		case !(
			Positive("neighborLimit", 0) &&
			Positive("evidenceLimit", 0) &&
			Positive("mapLimit", 0)
		):
			Fail("neighborLimit, evidenceLimit and mapLimit must be integers >= 0");
			break;
		case !Array.isArray(Cell(Raw["lenses"])) || typeof Cell(Raw["lensDefault"]) !== "string":
			Fail("lenses must be an array and lensDefault a string");
			break;
		default:
	}
};

export default (Context: Context, Options: Config): void => {
	Validate(Options);
	const Factory = Context.pluginFactory as unknown as FactoryHandle;
	const State = Factory.State(Context, Options, {
		module: "context",
		fields: {
			On: "enabled",
			BudgetTokens: "budgetTokens",
			BudgetMaximum: "budgetMaximum",
			Lenses: "lenses",
			LensDefault: "lensDefault",
			NeighborLimit: "neighborLimit",
			EvidenceLimit: "evidenceLimit",
			MapLimit: "mapLimit",
			WorkspaceName: "workspaceName",
			Allow: "policy",
		},
	}) as State;
	State.Factory = Factory;
	State.Focus = new Map();
	State.Cache = new Map();
	State.Packets = 0;
	State.Clamped = 0;
	State.Stale = 0;

	// The sibling graph handle: probed, never injected (an absent sibling is
	// an honest OPEN line in the packet, never a load failure).
	State.Graph = Context.get?.("workspaceGraph");

	// The optional token meter: probed once (V4-1 section 4).
	State.Meter = Context.get?.("tokenMeter") as
		{ estimate?: (text: string) => number } | undefined;

	// The service is registered from apply: the Service base constructor
	// calls ctx.reflect.provide("workspaceContext", this).
	new ServiceClass(Context, State);
	// The mount line: the activation proof when live, the byte-exact disabled
	// marker when not (the module's own composed line; the cold mount stays
	// honest in the ledger and every surface below still registers).
	Factory.Append(
		State,
		Proof(State.On !== false, [
			["budget", `${State.BudgetTokens}/${State.BudgetMaximum}`],
			["lenses", String(State.Lenses.length)],
		]),
	);

	// The trace adapter (D5): consume `graph/invalidated` to invalidate the
	// packet memo. Registered on EVERY mount (the live disabled posture); the
	// bus is optional (an absent service subscribes to nothing), the
	// subscription is disposed with the fiber, and the consumer answers the
	// disabled posture at call time (State.On read live).
	Adapter(State);

	// The tool registration (the live-containers posture: the context's
	// `tools` facility, probed defensively). Registered on EVERY mount; the
	// tool answers its disabled refusal at call time (State.On read live).
	const Tools = Context.get?.("tools") as
		{ register?: (definition: unknown) => void } | undefined;
	Tools?.register?.(Tool(State));

	// The test probe (live-containers precedent): apply returns NOTHING; the
	// state is exposed through the context attachment.
	(Context as unknown as Record<string, unknown>)["__pluginDshWorkspaceContextState"] = State;
};
