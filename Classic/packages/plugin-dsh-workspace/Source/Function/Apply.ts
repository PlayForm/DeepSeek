// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the durable
// activation proof, and the FOUR navigation tools (the only conversational
// surface - WORKSPACE-AGENT.md section 2). There are NO event listeners in
// v0: the agent is a consumer of the graph service and the surface for the
// conversation - the invisible flow (the stamps, the indexes, the gates)
// belongs to the sibling hooks, not to the agent.
//
// THE DISABLED POSTURE: enabled=false ships default - the State build logs
// `disabled (enabled=false)` and every tool no-ops to a clear refusal
// (each checks State.On first).
//
// `inject: ["workspaceGraph", "pluginFactory", "tools"]` (Library.ts) - the
// graph provides the data, the factory the State builder + the ledger, and
// tools the registration surface.
import type { Context } from "@deepseek-ai/cordis";
import ToolContext from "@Function/ToolContext.js";
import ToolExpand from "@Function/ToolExpand.js";
import ToolFind from "@Function/ToolFind.js";
import ToolMap from "@Function/ToolMap.js";
import type Config from "@Interface/Config.js";
import type { NodeKind } from "@Interface/Graph.js";
import type State from "@Interface/State.js";
import type { Log } from "@Interface/State.js";
import { Activate } from "@playform/lib-dsh-core";

// The bundle version, mirrored from package.json (the activation proof's
// first field; a release bumps both together).
const Version = "0.1.0";

/** Unwrap one possibly-volatile config cell (`{ get }` reference or value):
 * the loader hands volatile fields as cells, so every validation read goes
 * through this (the batch-decision Apply precedent). */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

/** The fail-loud validation (the schema always fills defaults; a hand-built
 * config in tests must still be complete). Every knob is read through the
 * Cell unwrap - volatile fields arrive as `{ get }` cells. */
const Validate = (Options: Config): void => {
	const Fail = (Message: string): never => {
		throw new Error(`plugin-dsh-workspace: ${Message}`);
	};
	const Raw = Options as unknown as Record<string, unknown>;
	const Numeric = (Value: unknown): number =>
		typeof Value === "number" && Number.isFinite(Value) ? Value : -1;
	if (!(Numeric(Cell(Raw["mapDepth"])) >= 1)) Fail("mapDepth must be >= 1");
	if (!(Numeric(Cell(Raw["mapMaxModules"])) >= 1)) Fail("mapMaxModules must be >= 1");
	if (!(Numeric(Cell(Raw["findLimit"])) >= 1)) Fail("findLimit must be >= 1");
	if (!(Numeric(Cell(Raw["findLimitMax"])) >= Numeric(Cell(Raw["findLimit"]))))
		Fail("findLimitMax must be >= findLimit");
	if (!(Numeric(Cell(Raw["expandDepth"])) >= 1) || Numeric(Cell(Raw["expandDepth"])) > 3)
		Fail("expandDepth must be >= 1 and <= 3 (the graph contract caps depth at 3)");
	if (!(Numeric(Cell(Raw["expandMaxNeighbors"])) >= 1)) Fail("expandMaxNeighbors must be >= 1");
	if (!(Numeric(Cell(Raw["packetTokenBudget"])) >= 1)) Fail("packetTokenBudget must be >= 1");
	if (!(Numeric(Cell(Raw["packetTokenMax"])) >= Numeric(Cell(Raw["packetTokenBudget"]))))
		Fail("packetTokenMax must be >= packetTokenBudget");
	if (!(Numeric(Cell(Raw["tokenCharsPerToken"])) >= 1)) Fail("tokenCharsPerToken must be >= 1");
	if (!Array.isArray(Cell(Raw["kinds"]))) Fail("kinds must be an array of node kinds");
	for (const Kind of (Cell(Raw["kinds"]) as NodeKind[]) ?? []) {
		if (!["File", "Symbol", "Block", "Test", "DocSection"].includes(Kind)) {
			Fail(`kinds contains an unknown node kind: ${String(Kind)}`);
		}
	}
};

export default (Context: Context, Options: Config): void => {
	// Fail-loud validation BEFORE the State build: invalid config throws at
	// load, never silently defaults (the tool-coach precedent).
	Validate(Options);

	// The injected factory service (typed via Interface/Context augmentation).
	const Factory = Context.pluginFactory;
	const Graph = Context.workspaceGraph;

	// The State: the factory's shared shape plus the plugin's own fields,
	// copied from the (cell-unwrapped) validated config by the setup map.
	// Every mapped field is volatile in the schema, so the factory's P10
	// loader/volatile-update listener refreshes them IN PLACE.
	const State_: State = Factory.State<State>(Context, Options, {
		module: "plugin-dsh-workspace",
		fields: {
			On: "enabled",
			MapDepth: "mapDepth",
			MapMaxModules: "mapMaxModules",
			FindLimit: "findLimit",
			FindLimitMax: "findLimitMax",
			ExpandDepth: "expandDepth",
			ExpandMaxNeighbors: "expandMaxNeighbors",
			PacketTokenBudget: "packetTokenBudget",
			PacketTokenMax: "packetTokenMax",
			TokenCharsPerToken: "tokenCharsPerToken",
			Kinds: "kinds",
		},
	});
	State_.Factory = Factory;
	State_.Graph = Graph;
	State_.LastPacketTokens = 0;

	// The ledger sink the tools receive (Factory.Append with the State bound).
	const Append: Log = (Message: string): void => {
		Factory.Append(State_, Message);
	};

	// Durable activation proof - "did it activate" must be answerable from the
	// ledger alone (the master switch and the surface on the line).
	if (!State_.On) {
		Factory.Append(State_, "disabled (enabled=false)");
	} else {
		Factory.Append(
			State_,
			Activate([
				["", `bundle ${Version}`],
				["tools", "4"],
			]),
		);
	}

	// The four navigation tools (V4-1 §3.4) - the ONLY conversational surface.
	// The registration is readonly after registration; the definitions are
	// built once here.
	const Tools = (
		Context as unknown as { tools?: { register?: (definition: unknown) => () => void } }
	).tools;
	if (typeof Tools?.register === "function") {
		Tools.register(ToolMap(State_, Append));
		Tools.register(ToolFind(State_, Append));
		Tools.register(ToolExpand(State_, Append));
		Tools.register(ToolContext(State_, Append));
	}

	// The loader ignores any return value; the end-phase smokes probe the
	// built State through this debug attachment instead.
	(Context as { __pluginDshWorkspaceState?: State }).__pluginDshWorkspaceState = State_;
};
