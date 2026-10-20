// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the durable
// activation proof, the FOUR phase-1 listeners, and the wave-2 extension
// (IMPLEMENTATION-DESIGN.md sections 2-6; the C2 additions are REGISTERED
// here - every wave-2 behavior lives in its own Function module):
//
//   L1  system-prompt/assemble  (waterfall, next() first, append-only):
//       the ONE live section named `sectionName` whose body is every enabled
//       block rendered inside the LIVE CONTAINER frame; global TTL cache
//       when refresh = "ttl"; fail-open try/catch, a render failure skips
//       the block and logs; the section carries interpolate: false so only
//       the plugin's own engine resolves its {{token}} groups;
//   L4  tools/post-execute      (waterfall, plain registration): updates the
//       counters the counter/gauge blocks read (last-tool timestamp, per-turn
//       attempt counts) and marks event-trigger blocks dirty;
//   L8  agent/pre-step          (waterfall, plain): the user-message
//       detection (the tool-coach precedent, Apply.ts:456-490) counts
//       messages/turns, resets per-turn counters, and marks event-trigger
//       blocks dirty;
//   L9  tools/change            (emit): clears every scope's section cache
//       (the tool-coach L5 pattern).
//
// WAVE-2 SET (appended; same disciplines):
//   L2  tools/pre-execute       (waterfall): the detach decision arm (G1) -
//       class rule, await marker, dedup, escalation, policy guards; on
//       transform it starts the job and tags the exec;
//   L3  tools/execute           (waterfall): the carrier arm - a tagged exec
//       returns the fabricated foreground result WITHOUT next();
//   L6  jobs events subscription (emit, host scope, filtered): the settled
//       truth (completion + boards) and the deadline checkpoints;
//   L7  session/event           (emit, host scope): the report pickup (G5)
//       and the completion delivery observer (I3 2.3);
//   tools: live_container_set + live_plant (the per-agent surface);
//   systemPrompt.context: the completion dynamic context (the I3 carrier).
//
// WAVE-3 SET (appended; same disciplines - the live file monitors, C3):
//   L11 fs/observed             (the factory's Wire, ROOT context): the
//       enrollment + the version truth (watchlist-gated);
//   L6  (extended): the monitors settle fold runs before the boards;
//   L1  (extended): the monitors stanza is one part of the wave-2 section,
//       after the boards and before the suggestions;
//   tools: live_monitor + live_monitor_check (the monitor surface);
//   effect: the P5-style monitor storage domain (own open, own recovery).
//
// THE WATERFALL DISCIPLINE: `next()` is ALWAYS awaited first; pass-through
// returns the downstream decision unchanged; FAIL-OPEN: every listener body
// is one try/catch - on any error a logger.warn records it and the
// downstream result is returned UNCHANGED. A live block never fails an
// assembly.
//
// NOT factory machinery, deliberately: no fs/observed Wire, no Attach, no
// factory Schema - the plugin owns its schema (Variable/Config) and its
// strings. The function returns NOTHING; test probes read the state through
// the `ctx.__hookDshLiveContainersState` attachment.
//
// `inject: ["pluginFactory", "tools"]` (Library.ts) - the factory provides
// the State builder + the ledger; `tools` is declared per the design's
// phase-1 inject list (the wave-2 listeners consume it; phase 1 never
// touches it).
import type { Context } from "@deepseek-ai/cordis";
import type { AssembleContext, PromptAssembly } from "@deepseek-ai/dsh-system-prompt";
// The type-only imports below publish the EVENT signatures on the cordis
// Events interface (the packages' own augmentations): dsh-tools declares the
// tools/* waterfalls + tools/change (and transitively dsh-agent's
// agent/pre-step), dsh-system-prompt declares system-prompt/assemble.
import type {
	PostToolDecision,
	PreToolDecision,
	ToolDispatchExecution,
	ToolExecution,
	ToolExecutionResult,
} from "@deepseek-ai/dsh-tools";
import { Activate } from "@playform/hook-dsh-core";

// The wave-2 modules (the C2 extension - each behavior in its own module;
// Apply only REGISTERS and wires).
import * as Board from "../Function/Board.js";
import Clock from "../Function/Clock.js";
import * as Completion from "../Function/Completion.js";
import Counters, { DefaultKey, RecordTool, RecordTurn, ScopeLabel } from "../Function/Counters.js";
import * as Detach from "../Function/Detach.js";
import * as Failsafe from "../Function/Failsafe.js";
import * as Monitors from "../Function/Monitors.js";
import * as MonitorTools from "../Function/MonitorTools.js";
import * as Plant from "../Function/Plant.js";
import Build, { Cached } from "../Function/Render.js";
import * as SetTool from "../Function/Set.js";
import * as Storage from "../Function/Storage.js";
import * as Suggester from "../Function/Suggester.js";
import type Config from "../Interface/Config.js";
import { KINDS, type AgentState, type BlockSpec } from "../Interface/Execution.js";
import type State from "../Interface/State.js";

// The bundle version, mirrored from package.json (the activation proof's
// first field; a release bumps both together).
const Version = "0.0.1";

/** Unwrap one possibly-volatile config cell (`{ get }` reference or value). */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

/** The fail-loud validation (research section 3 + design section 2). */
const Validate = (Options: unknown): void => {
	const Raw = (Options ?? {}) as Record<string, unknown>;
	const Num = (Key: string): number => Number(Cell(Raw[Key]));
	const Fail = (Message: string): never => {
		throw new Error(`hook-dsh-live-containers: ${Message}`);
	};
	if (
		typeof Cell(Raw["sectionName"]) !== "string" ||
		String(Cell(Raw["sectionName"])).length === 0
	) {
		Fail("sectionName must be a non-empty string");
	}
	if (!["request", "ttl"].includes(String(Cell(Raw["refresh"])))) {
		Fail('refresh must be one of "request" | "ttl"');
	}
	if (!(Num("ttlCalls") >= 1)) {
		Fail("ttlCalls must be >= 1");
	}
	if (typeof Cell(Raw["separator"]) !== "string" || String(Cell(Raw["separator"])).length === 0) {
		Fail("separator must be a non-empty string");
	}
	if (!(Num("sectionBudgetBytes") >= 1)) {
		Fail("sectionBudgetBytes must be >= 1");
	}
	const Blocks = Cell(Raw["blocks"]);
	if (!Array.isArray(Blocks)) {
		Fail("blocks must be an array of block specs");
		return;
	}
	const Seen = new Set<string>();
	for (const Block of Blocks as BlockSpec[]) {
		if (!Block || typeof Block.id !== "string" || Block.id.length === 0) {
			Fail("every block needs a non-empty id");
		}
		if (Seen.has(Block.id)) {
			Fail(`block ids must be unique: ${Block.id}`);
		}
		Seen.add(Block.id);
		if (!(KINDS as readonly string[]).includes(String(Block.kind))) {
			Fail(`block ${Block.id} has an unknown kind: ${String(Block.kind)}`);
		}
		if (typeof Block.template !== "string" || Block.template.length === 0) {
			Fail(`block ${Block.id} needs a non-empty template`);
		}
		if (
			Block.vars !== undefined &&
			(Block.vars === null || typeof Block.vars !== "object" || Array.isArray(Block.vars))
		) {
			Fail(`block ${Block.id} vars must be an object of string values`);
		}
		if (Block.vars) {
			for (const [Key, Value] of Object.entries(Block.vars as Record<string, unknown>)) {
				if (typeof Value !== "string") {
					Fail(`block ${Block.id} vars.${Key} must be a string`);
				}
			}
		}
		if (!["request", "event", "ttl", "manual"].includes(String(Block.trigger))) {
			Fail(`block ${Block.id} trigger must be one of "request" | "event" | "ttl" | "manual"`);
		}
		if (!(Number(Block.ttlCalls ?? 8) >= 1)) {
			Fail(`block ${Block.id} ttlCalls must be >= 1`);
		}
		if (
			!["always", "when-agents-active", "when-tasks-live", "never"].includes(
				String(Block.scope),
			)
		) {
			Fail(
				`block ${Block.id} scope must be one of "always" | "when-agents-active" | "when-tasks-live" | "never"`,
			);
		}
	}
	// WAVE-2 validation (appended only; the phase-1 checks above are
	// untouched). Every knob fails loud, never silently defaults.
	const DetachOptions = Cell(Raw["detach"]) as Record<string, unknown> | undefined;
	if (DetachOptions !== undefined && typeof DetachOptions === "object") {
		if (!["off", "long-running", "all", "selected"].includes(String(DetachOptions["mode"]))) {
			Fail('detach.mode must be one of "off" | "long-running" | "all" | "selected"');
		}
		if (
			String(DetachOptions["mode"]) === "all" &&
			Cell(DetachOptions["allRequiresConfirm"]) !== true
		) {
			Fail(
				'detach.mode "all" is DANGEROUS (every command-runner call detaches) and requires allRequiresConfirm: true',
			);
		}
		if (
			!(Num2(Cell(DetachOptions["liveTimeoutMs"])) >= 1000) ||
			!(Num2(Cell(DetachOptions["liveTimeoutMs"])) <= 600000)
		) {
			Fail(
				"detach.liveTimeoutMs must be >= 1000 and <= 600000 (the inline deadline is 120000 - detachment must never buy extra runtime)",
			);
		}
		if (!(Num2(Cell(DetachOptions["maxLivePerAgent"])) >= 1)) {
			Fail("detach.maxLivePerAgent must be >= 1");
		}
		if (!(Num2(Cell(DetachOptions["retryFailsafeCount"])) >= 1)) {
			Fail("detach.retryFailsafeCount must be >= 1");
		}
	}
	const PlantOptions = Cell(Raw["plant"]) as Record<string, unknown> | undefined;
	if (PlantOptions !== undefined && typeof PlantOptions === "object") {
		if (!(Num2(Cell(PlantOptions["leaseTurns"])) >= 1)) {
			Fail("plant.leaseTurns must be >= 1");
		}
		if (!(Num2(Cell(PlantOptions["boardsPerAgent"])) >= 1)) {
			Fail("plant.boardsPerAgent must be >= 1");
		}
	}
	if (!["off", "on"].includes(String(Cell(Raw["failsafes"])))) {
		Fail('failsafes must be one of "off" | "on"');
	}
	if (!["warn-only", "kill"].includes(String(Cell(Raw["hangAction"])))) {
		Fail('hangAction must be one of "warn-only" | "kill"');
	}
	if (!(Num2(Cell(Raw["failsafesPerTurn"])) >= 1)) {
		Fail("failsafesPerTurn must be >= 1");
	}
	if (!["off", "section", "plant"].includes(String(Cell(Raw["suggester"])))) {
		Fail('suggester must be one of "off" | "section" | "plant"');
	}
	if (!["redact", "verbatim"].includes(String(Cell(Raw["suggesterPrivacy"])))) {
		Fail('suggesterPrivacy must be one of "redact" | "verbatim"');
	}
	if (!(Num2(Cell(Raw["completionCapBytes"])) >= 512)) {
		Fail("completionCapBytes must be >= 512");
	}
	// WAVE-3 validation (appended only; the phase-1 and wave-2 checks above
	// are untouched). Every knob fails loud, never silently defaults.
	if (!["off", "on"].includes(String(Cell(Raw["monitors"])))) {
		Fail('monitors must be one of "off" | "on"');
	}
	const Watchlist = Cell(Raw["watchlist"]);
	if (!Array.isArray(Watchlist)) {
		Fail("watchlist must be an array of { glob, checks } entries");
	}
	for (const Entry of Watchlist as unknown[]) {
		const Record = Entry as { glob?: unknown; checks?: unknown } | null;
		if (Record === null || typeof Record.glob !== "string" || Record.glob.length === 0) {
			Fail("every watchlist entry needs a non-empty glob string");
			continue;
		}
		if (
			!Array.isArray(Record.checks) ||
			Record.checks.some((Check) => typeof Check !== "string")
		) {
			Fail("every watchlist entry needs checks as an array of strings");
		}
	}
	const CheckSets = (Cell(Raw["checksets"]) ?? {}) as Record<string, unknown>;
	for (const [Id, Spec] of Object.entries(CheckSets)) {
		if (Spec === null || typeof Spec !== "object") {
			Fail(`checksets.${Id} must be an object`);
			continue;
		}
		const S = Spec as {
			command?: unknown;
			link?: unknown;
			fast?: unknown;
			intervalMs?: unknown;
			timeoutMs?: unknown;
		};
		if (S.link !== undefined && !["none", "governance"].includes(String(S.link))) {
			Fail(`checksets.${Id}.link must be one of "none" | "governance"`);
		}
		if (S.link === undefined && (typeof S.command !== "string" || S.command.length === 0)) {
			Fail(`checksets.${Id} needs a non-empty command when link is absent`);
		}
		if (S.fast !== undefined && typeof S.fast !== "boolean") {
			Fail(`checksets.${Id}.fast must be a boolean`);
		}
		if (S.intervalMs !== undefined && !(Number(S.intervalMs) >= 0)) {
			Fail(`checksets.${Id}.intervalMs must be >= 0`);
		}
		if (
			S.timeoutMs !== undefined &&
			!(Number(S.timeoutMs) >= 1000 && Number(S.timeoutMs) <= 120000)
		) {
			Fail(
				`checksets.${Id}.timeoutMs must be >= 1000 and <= 120000 (the inline deadline - checks never buy extra runtime)`,
			);
		}
	}
	for (const Entry of Watchlist as { checks?: unknown }[]) {
		for (const Id of (Entry.checks as unknown[] | undefined) ?? []) {
			if (typeof Id === "string" && !(Id in CheckSets)) {
				Fail(`watchlist references an unknown check set: ${Id}`);
			}
		}
	}
	// The monitor knobs: a non-object value fails loud; otherwise every
	// numeric knob is checked strictly (the schema always fills them; a
	// hand-built config without them is invalid).
	const MonitorRaw = Cell(Raw["monitor"]);
	if (
		MonitorRaw !== null &&
		MonitorRaw !== undefined &&
		(typeof MonitorRaw !== "object" || Array.isArray(MonitorRaw))
	) {
		Fail("monitor must be an object of monitor knobs");
	}
	const MonitorCell = (
		typeof MonitorRaw === "object" && MonitorRaw !== null ? MonitorRaw : {}
	) as Record<string, unknown>;
	// A strict numeric helper for the monitor knobs: absent or non-finite
	// values fail loud (the schema always fills them; a hand-built config
	// without them is invalid).
	const MNum = (Value: unknown): number =>
		typeof Value === "number" && Number.isFinite(Value) ? Value : -1;
	if (!(MNum(MonitorCell["debounceMs"]) >= 1)) {
		Fail("monitor.debounceMs must be >= 1");
	}
	if (!(MNum(MonitorCell["maxMonitors"]) >= 1)) {
		Fail("monitor.maxMonitors must be >= 1");
	}
	if (!(MNum(MonitorCell["maxMonitorJobs"]) >= 1)) {
		Fail("monitor.maxMonitorJobs must be >= 1");
	}
	if (!(MNum(MonitorCell["retireMs"]) >= 1)) {
		Fail("monitor.retireMs must be >= 1");
	}
	if (!(MNum(MonitorCell["staleMs"]) >= 1)) {
		Fail("monitor.staleMs must be >= 1");
	}
	if (!(MNum(MonitorCell["slowCheckIntervalMs"]) >= 0)) {
		Fail("monitor.slowCheckIntervalMs must be >= 0");
	}
	if (!(MNum(MonitorCell["bandCapBytes"]) >= 256)) {
		Fail("monitor.bandCapBytes must be >= 256");
	}
	if (
		!(MNum(MonitorCell["checkTimeoutMs"]) >= 1000) ||
		!(MNum(MonitorCell["checkTimeoutMs"]) <= 120000)
	) {
		Fail(
			"monitor.checkTimeoutMs must be >= 1000 and <= 120000 (the inline deadline - the composition contract, like detach.liveTimeoutMs)",
		);
	}
	if (!(MNum(MonitorCell["linkageAlertVersions"]) >= 0)) {
		Fail("monitor.linkageAlertVersions must be >= 0");
	}
	if (!(MNum(MonitorCell["dedupWindowMs"]) >= 0)) {
		Fail("monitor.dedupWindowMs must be >= 0");
	}
};

/** A number-or-default helper for the wave-2 validation (the phase-1 Num
 * helper throws on absent keys; the wave-2 knobs always have schema defaults,
 * but a hand-built config in tests may omit them). */
const Num2 = (Value: unknown): number =>
	typeof Value === "number" && Number.isFinite(Value) ? Value : 1;

/** Mark every event-trigger block dirty for one scope (the per-block event
 * wiring: pre-step and post-execute are the phase-1 event sources). */
const Dirty = (Agent: State, Scope: AgentState): void => {
	for (const Block of Agent.Blocks ?? []) {
		if (Block.trigger !== "event") {
			continue;
		}
		const Cache = Scope.blocks.get(Block.id);
		if (Cache) {
			Cache.dirty = true;
		}
	}
};

/** The agent id of an assemble context (assembleContextFor sets scope = agent
 * - verified against dsh-agent; the opaque-key rule still applies to the
 * phase-1 counters, which stay module-global). */
const AgentIdOf = (Context_: AssembleContext | undefined): string => {
	const Agent = (Context_ as { agent?: { id?: string } | undefined } | undefined)?.agent?.id;
	return typeof Agent === "string" && Agent.length > 0 ? Agent : "(unowned)";
};

/** The wave-2 assemble pass (one assemble = one parent turn/admission): the
 * turn bookkeeping, the lease decrement, the wave-2 section parts, and the
 * post-render prune. Returns the wave-2 body text ("" when nothing renders). */
const WaveAssemble = (
	Agent: State,
	Context_: AssembleContext | undefined,
	Scope: AgentState,
	Append: (Message: string) => void,
): string => {
	try {
		if (!Agent.On) {
			return "";
		}
		const AgentId = AgentIdOf(Context_);
		const At = Clock(Agent);
		// One assemble pass = one parent turn (I5 1.4): the count advances
		// before render; the previous-pass clock is overwritten only AFTER the
		// render, so the orphan check sees the real gap (I5 2.4).
		Agent.TurnCounts.set(AgentId, (Agent.TurnCounts.get(AgentId) ?? 0) + 1);
		// The lease decrement runs BEFORE render, so the declaration appears in
		// the SAME assembly's frame (I5 4.2).
		Board.OnTurn(Agent, AgentId, Append);
		// The wave-2 parts, in order: the live jobs + boards (per frame), the
		// monitors stanza, the suggestions, the drift guard - per-frame
		// granularity for the collapse. The monitors stanza is ONE part (the
		// design section 5.1: the section collapse treats it as a unit, the
		// summary band stays inside it).
		const Parts: string[] = [
			...Board.SectionParts(Agent, AgentId, Agent.Separator, Append),
			...Monitors.SectionParts(Agent, AgentId, Agent.Separator, Append),
		];
		const Suggestions = Suggester.SectionBody(Agent, AgentId, Agent.Separator, Append);
		if (Suggestions.length > 0) {
			Parts.push(Suggestions);
		}
		const Warn = Failsafe.Drift(
			Agent,
			AgentId,
			{ messages: Scope.messages, lastToolAt: Scope.lastToolAt },
			Append,
		);
		if (Warn.length > 0) {
			Parts.push(Warn);
		}
		if (Parts.length === 0) {
			return "";
		}
		// The post-render prune (I5 4.2: the prune acts after the render and
		// mutates the state for the NEXT assembly).
		Board.FailsafeStall(Agent, AgentId, Append);
		// The previous-pass clock updates after the render (the orphan check).
		Agent.LastTurnAt.set(AgentId, At);
		// The wave-2 section-collapse pass (scenario 8) over the wave parts.
		return Failsafe.Collapse(Agent, Parts, Append);
	} catch (Error) {
		// Fail-open: the wave-2 body never breaks an assembly.
		void Error;
		return "";
	}
};

/** The wave-2 pre-step hook (the suggester trigger, I6 section 6.1): a new
 * user message that passes the gate spawns exactly one detached suggestion. */
const WavePreStep = (Agent: State, Payload: unknown, Append: (Message: string) => void): void => {
	try {
		if (!Agent.On || Agent.Suggester === "off") {
			return;
		}
		const Step = Payload as {
			agent?: { id?: string } | undefined;
			messages?: {
				source?: { kind?: string };
				content?: { type?: string; text?: string }[];
			}[];
		};
		if (!Array.isArray(Step.messages)) {
			return;
		}
		const Users = Step.messages.filter((Message) => Message?.source?.kind === "user");
		const First = Users[0];
		if (First === undefined) {
			return;
		}
		const Text = (First.content ?? [])
			.map((Block) => (Block?.type === "text" ? (Block.text ?? "") : ""))
			.join("");
		const AgentId = Step.agent?.id ?? "";
		Suggester.OnUserMessage(
			Agent,
			AgentId,
			Text,
			Step.agent as { id: string } | undefined,
			Append,
		);
	} catch (Error) {
		void Error;
	}
};

export default (Context: Context, Options: Config): void => {
	// Fail-loud validation BEFORE the State build: invalid config throws at
	// load, never silently defaults (the tool-coach precedent).
	Validate(Options);

	// The injected factory service (typed via Interface/Factory's augmentation).
	const Factory = Context.pluginFactory;

	// The State: the factory's shared shape plus the plugin's own fields,
	// copied from the (cell-unwrapped) validated config by the setup map.
	// Every mapped field is volatile in the schema, so the factory's P10
	// loader/volatile-update listener refreshes them IN PLACE - a flip
	// (enabled, refresh, ttlCalls, separator, budget, the block table, ...)
	// lands on the next assembly without a remount.
	const State: State = Factory.State<State>(Context, Options, {
		module: "hook-dsh-live-containers",
		fields: {
			On: "enabled",
			SectionName: "sectionName",
			Refresh: "refresh",
			TtlCalls: "ttlCalls",
			Separator: "separator",
			Budget: "sectionBudgetBytes",
			Blocks: "blocks",
			// WAVE-3 (appended only): the monitor flip and the monitor knobs
			// ride the same P10 volatile refresh - a flip (monitors off->on,
			// a watchlist entry change, a debounceMs change) lands on the
			// next assembly without a remount.
			MonitorOn: "monitors",
			Monitor: "monitor",
			Watchlist: "watchlist",
			CheckSets: "checksets",
		},
	});
	State.Factory = Factory;
	State.Agents = new WeakMap();
	State.Registry = new Set();
	State.Labels = new WeakMap();
	State.LabelCount = 0;
	// The wave-2 state (appended only): per-agent records keyed on the agent's
	// session id, the exec tags, and the config-derived wave-2 knobs (unwrapped
	// from their volatile cells).
	const DetachCell = (Cell(Options.detach) ?? {}) as Record<string, unknown>;
	const PlantCell = (Cell(Options.plant) ?? {}) as Record<string, unknown>;
	const RouteCell = (Cell(Options.suggesterRoute) ?? {}) as Record<string, unknown>;
	const Str = (Value: unknown, Fallback: string): string =>
		typeof Value === "string" && Value.length > 0 ? Value : Fallback;
	const Num = (Value: unknown, Fallback: number): number =>
		typeof Value === "number" && Number.isFinite(Value) ? Value : Fallback;
	const StrArray = (Value: unknown, Fallback: string[]): string[] =>
		Array.isArray(Value)
			? Value.filter((Item): Item is string => typeof Item === "string")
			: Fallback;
	State.Detach = {
		mode: (["off", "long-running", "all", "selected"] as const).includes(
			DetachCell["mode"] as never,
		)
			? (DetachCell["mode"] as "off" | "long-running" | "all" | "selected")
			: "off",
		allRequiresConfirm: DetachCell["allRequiresConfirm"] === true,
		longRunningMarkers: StrArray(DetachCell["longRunningMarkers"], [
			"cargo build",
			"pnpm build",
			"npm install",
			"pnpm install",
			"pip install",
			"cmake",
			"make",
			"go build",
			"tsc -b",
			"next build",
		]),
		minHistoricalMs: Num(DetachCell["minHistoricalMs"], 20000),
		historyWindow: Num(DetachCell["historyWindow"], 5),
		selectedTools: StrArray(DetachCell["selectedTools"], []),
		selectedPatterns: StrArray(DetachCell["selectedPatterns"], []),
		maxLivePerAgent: Num(DetachCell["maxLivePerAgent"], 5),
		minLatencyMs: Num(DetachCell["minLatencyMs"], 2000),
		liveTimeoutMs: Num(DetachCell["liveTimeoutMs"], 120000),
		dedup: DetachCell["dedup"] !== false,
		retryFailsafeCount: Num(DetachCell["retryFailsafeCount"], 3),
	};
	State.Plant = {
		stallMs: Num(PlantCell["stallMs"], 45000),
		closeMs: Num(PlantCell["closeMs"], 300000),
		reportRateMs: Num(PlantCell["reportRateMs"], 2000),
		stallBudgetMs: Num(PlantCell["stallBudgetMs"], 180000),
		stallAction: PlantCell["stallAction"] === "prune" ? "prune" : "warn-only",
		orphanBudgetMs: Num(PlantCell["orphanBudgetMs"], 600000),
		boardsPerAgent: Num(PlantCell["boardsPerAgent"], 4),
		leaseTurns: Num(PlantCell["leaseTurns"], 3),
	};
	State.Failsafes = Cell(Options.failsafes) === "on" ? "on" : "off";
	State.HangBudgetMs = Num(Cell(Options.hangBudgetMs), 120000);
	State.HangAction = Cell(Options.hangAction) === "kill" ? "kill" : "warn-only";
	State.FailsafesPerTurn = Num(Cell(Options.failsafesPerTurn), 5);
	State.Suggester = (["off", "section", "plant"] as const).includes(
		Cell(Options.suggester) as never,
	)
		? (Cell(Options.suggester) as "off" | "section" | "plant")
		: "off";
	State.SuggesterPrivacy = Cell(Options.suggesterPrivacy) === "verbatim" ? "verbatim" : "redact";
	State.SuggestGateMinChars = Num(Cell(Options.suggestGateMinChars), 40);
	State.MaxSuggestionsPerHour = Num(Cell(Options.maxSuggestionsPerHour), 6);
	State.MaxPromptBytes = Num(Cell(Options.maxPromptBytes), 4000);
	State.SuggestTimeoutMs = Num(Cell(Options.suggestTimeoutMs), 8000);
	State.AutoPlant = Cell(Options.autoPlant) === true;
	State.SuggesterRoute = {
		provider: Str(RouteCell["provider"], "cloudflare-workers-ai"),
		model: Str(RouteCell["model"], "@cf/zai-org/glm-5.3-flash"),
		reasoningEffort: Str(RouteCell["reasoningEffort"], "low"),
	};
	State.CompletionCapBytes = Num(Cell(Options.completionCapBytes), 4096);
	State.Detached = new Map();
	State.Tagged = new WeakMap();
	State.Pending = new Map();
	State.Boards = new Map();
	State.Suggestions = new Map();
	State.SuggesterTicks = new Map();
	State.DedupCounts = new Map();
	State.MetaBudget = new Map();
	State.TurnCounts = new Map();
	State.History = new Map();
	State.CallStarts = new Map();
	State.HangWatch = new Map();
	State.LastTurnAt = new Map();
	State.Variables = new Map();
	// The wave-3 state (appended only): the per-agent monitor sets, the live
	// monitor jobs, and the storage sink (the P5-style open fills it). The
	// monitor knobs (MonitorOn/Monitor/Watchlist/CheckSets) come from the
	// fields map above - they ride the P10 volatile refresh.
	State.Monitors = new Map();
	State.MonitorJobs = new Map();
	State.MonitorSessions = new Map();
	State.MonitorOptOuts = new Map();
	State.MonitorSlowLast = new Map();
	State.MonitorCallSeq = 0;
	State.MonitorsQueue = [];
	State.MonitorsJournal = () => {};
	State.MonitorsPersist = false;
	State.MonitorDomain = undefined;
	State.MonitorOverflowLast = 0;
	State.Wave = (() => {
		const Raw = Context as unknown as Record<string, unknown>;
		return {
			Jobs: Raw["jobs"] as NonNullable<State["Wave"]>["Jobs"],
			Shell: Raw["shell"] as NonNullable<State["Wave"]>["Shell"],
			ShellEnv: Raw["shellEnv"] as NonNullable<State["Wave"]>["ShellEnv"],
			WorkingDirectory: Raw["workingDirectory"] as NonNullable<
				State["Wave"]
			>["WorkingDirectory"],
			Subagent: Raw["subagent"] as NonNullable<State["Wave"]>["Subagent"],
			Agents: Raw["agents"] as NonNullable<State["Wave"]>["Agents"],
			SandboxPolicy: Raw["sandboxPolicy"] as NonNullable<State["Wave"]>["SandboxPolicy"],
		};
	})();
	// The wave-2 cross-module bindings (the board module's Open for the
	// suggester's dormant blocks).
	Suggester.BindBoard(Board.Open);

	// The counter state accessor. PHASE-1 ATTRIBUTION: the counters are
	// MODULE-GLOBAL - the assemble context exposes only an opaque scope key
	// (dsh-scope ScopeKey, never parsed - the family's capability rule), so
	// the section cannot attribute counters per agent; the plugin counts what
	// it observes harness-wide (the tool-coach's effective DefaultKey
	// behavior, Apply.ts:512). The WeakMap structure stays keyed per object
	// for wave 2, which may attribute per agent if the scope key proves to be
	// the agent. The single default state is created eagerly.
	const Shared: AgentState = Counters();
	State.Agents.set(DefaultKey, Shared);
	State.Registry.add(Shared);
	const Agent = (_Key: unknown): AgentState => Shared;

	// The ledger sink the render engine receives (Factory.Append with the
	// State bound).
	const Append = (Message: string): void => {
		Factory.Append(State, Message);
	};

	// Durable activation proof - "did it activate" must be answerable from the
	// ledger alone (the master switch and the render knobs on the line).
	if (!State.On) {
		Factory.Append(State, "disabled (enabled=false)");
	} else {
		Factory.Append(
			State,
			Activate([
				["", `bundle ${Version}`],
				["blocks", String((State.Blocks ?? []).length)],
				["refresh", State.Refresh],
			]),
		);
		// The monitors layer's own on-state proof (the wave-3 addition): the
		// second explicit flip after the plugin's enable. "off" - the default
		// and the shipped state - proves nothing and logs nothing.
		if (State.MonitorOn === "on") {
			Factory.Append(
				State,
				`monitors enabled (${(State.Watchlist ?? []).length} watchlist entries)`,
			);
		}
	}

	// ------------------------------------------------------------------
	// Listener L1: system-prompt/assemble (the live section). After next():
	// the plugin appends ONE section to the downstream assembly and returns
	// it otherwise unchanged - the returned assembly is authoritative, so the
	// plugin touches nothing else. The section carries interpolate: false so
	// the harness's own prompt variables never resolve (or fail on) our
	// tokens.
	// ------------------------------------------------------------------
	Context.on(
		"system-prompt/assemble",
		async (
			_Assembly: PromptAssembly,
			AssembleContext: AssembleContext,
			Next: () => Promise<PromptAssembly>,
		): Promise<PromptAssembly> => {
			// next() FIRST: the downstream listeners settle before any decision.
			const Downstream = await Next();
			try {
				if (!State.On) {
					return Downstream;
				}
				const Scope = Agent(AssembleContext?.scope);
				const Label = ScopeLabel(State, AssembleContext?.scope);
				// One assembly consumed (the TTL clock) - advanced before the
				// cache check so both paths see the same count.
				Scope.calls += 1;
				// The global TTL cache hit: the body is returned unchanged, no
				// rebuild, no ledger line.
				const Fresh = Cached(State, Scope);
				const Text = Fresh ?? Build(State, Scope, Label, Append);
				// WAVE-2 ASSEMBLE HOOK (appended; the phase-1 logic above is
				// untouched): the wave-2 section parts - the live-container
				// frames, the fleet line, the planted boards, the suggestions,
				// the drift guard - computed per assembly. Empty when no wave-2
				// state exists, in which case the section is byte-identical
				// with the phase-1 behavior.
				const WaveText = WaveAssemble(State, AssembleContext, Scope, Append);
				const Full =
					WaveText.length === 0
						? Text
						: Text.length === 0
							? WaveText
							: `${Text}\n${WaveText}`;
				if (Full.length === 0) {
					return Downstream;
				}
				return {
					...Downstream,
					sections: [
						...Downstream.sections,
						{ name: State.SectionName, text: Full, interpolate: false },
					],
				};
			} catch (Error) {
				// Fail-open: the section never breaks an assembly.
				try {
					Context.logger?.warn(
						`hook-dsh-live-containers: ${String(Error)}; the assembly passes through`,
					);
				} catch {
					/* logger optional */
				}
				return Downstream;
			}
		},
	);

	// ------------------------------------------------------------------
	// Listener L4: tools/post-execute (the counter observer). Plain
	// registration - runs AFTER the ccr {prepend:true} listener and
	// normalize's post-execute. Pure observer: records the tool fact for the
	// counter/gauge variables and marks event-trigger blocks dirty; the
	// downstream decision is returned unchanged.
	// ------------------------------------------------------------------
	Context.on(
		"tools/post-execute",
		async (
			Exec: ToolExecution,
			_Result: Readonly<ToolExecutionResult>,
			Next: () => Promise<PostToolDecision>,
		): Promise<PostToolDecision> => {
			// next() FIRST: the downstream listeners settle before any decision.
			const Downstream = await Next();
			try {
				if (!State.On) {
					return Downstream;
				}
				const Scope = Agent(Exec.agent);
				RecordTool(Scope, Exec.name, Clock(State));
				Dirty(State, Scope);
				// WAVE-2 HOOK (appended): the inline command's duration for the
				// long-running history (a detached call never reaches here - its
				// body never ran).
				Detach.PostExecute(State, Exec);
				return Downstream;
			} catch (Error) {
				// Fail-open: the counters never break a waterfall.
				try {
					Context.logger?.warn(
						`hook-dsh-live-containers: ${String(Error)}; the counters are skipped`,
					);
				} catch {
					/* logger optional */
				}
				return Downstream;
			}
		},
	);

	// ------------------------------------------------------------------
	// Listener L8: agent/pre-step (the user-message boundary). Mirrors the
	// tool-coach's chain reset: a new user message counts the messages,
	// advances the turn, resets the per-turn attempt counters, and marks the
	// event-trigger blocks dirty (the block table re-renders at the next
	// assembly).
	// ------------------------------------------------------------------
	Context.on("agent/pre-step", async (Payload, Next) => {
		// next() FIRST: the downstream listeners settle before any decision.
		const Downstream = await Next();
		try {
			const Step = Payload as {
				agent?: unknown;
				messages?: { source?: { kind?: string } }[];
			};
			if (Array.isArray(Step.messages)) {
				const Users = Step.messages.filter((M) => M?.source?.kind === "user").length;
				if (Users > 0) {
					const Scope = Agent(Step.agent);
					RecordTurn(Scope, Users);
					Dirty(State, Scope);
				}
			}
		} catch (Error) {
			// Fail-open: the counters never break a step.
			try {
				Context.logger?.warn(
					`hook-dsh-live-containers: ${String(Error)}; the counters are skipped`,
				);
			} catch {
				/* logger optional */
			}
		}
		// WAVE-2 HOOK (appended): the suggester gate (I6 section 6.1) - the
		// fail-open wrapper is inside WavePreStep, never into the waterfall.
		WavePreStep(State, Payload, Append);
		return Downstream;
	});

	// ------------------------------------------------------------------
	// Listener L9: tools/change (the section-cache invalidation). Emit mode:
	// clears every live scope's section cache so the next assembly rebuilds
	// the body from the NEW registry.
	// ------------------------------------------------------------------
	Context.on("tools/change", (): void => {
		try {
			if (!State.On) {
				return;
			}
			let Cleared = false;
			for (const Scope of State.Registry) {
				if (Scope.sectionCache) {
					Scope.sectionCache = undefined;
					Cleared = true;
				}
			}
			if (Cleared) {
				Append("section rebuilt (tools/change)");
			}
		} catch (Error) {
			try {
				Context.logger?.warn(
					`hook-dsh-live-containers: ${String(Error)}; the cache survives`,
				);
			} catch {
				/* logger optional */
			}
		}
	});

	// ==================================================================
	// THE WAVE-2 LISTENERS (the C2 extension - new registrations only; the
	// phase-1 set above is untouched). Each: next()-first where the event is
	// a waterfall, fail-open everywhere, ledger on the plugin's own file only.
	// THE ARMING GATE: the wave-2 half arms only when the jobs stack is
	// composed. In production `inject` guarantees ctx.jobs, so the gate is
	// always open there; the bare phase-1 fixture (no services) mounts the
	// phase-1 listener set unchanged, byte-for-byte.
	// ==================================================================
	const WaveArmed = State.Wave.Jobs !== undefined;

	// ------------------------------------------------------------------
	// Listener L2: tools/pre-execute (the detach transform's decision arm).
	// next() FIRST; every branch pass-through + ledger, never a deny.
	// ------------------------------------------------------------------
	if (WaveArmed)
		Context.on(
			"tools/pre-execute",
			async (
				Exec: ToolExecution,
				Next: () => Promise<PreToolDecision>,
			): Promise<PreToolDecision> => Detach.PreExecute(State, Exec, Next, Append),
		);

	// ------------------------------------------------------------------
	// Listener L3: tools/execute (the detach transform's carrier arm). When
	// the exec is tagged, the fabricated result REPLACES the dispatch without
	// calling next() - the bash body never runs.
	// ------------------------------------------------------------------
	if (WaveArmed)
		Context.on(
			"tools/execute",
			async (
				Exec: ToolDispatchExecution,
				Next: () => Promise<ToolExecutionResult>,
			): Promise<ToolExecutionResult> => Detach.Execute(State, Exec, Next, Append),
		);

	// ------------------------------------------------------------------
	// Listener L6: the jobs settled subscription (the jobs truth). A host
	// subscription receives every owner's events and filters by the plugin's
	// own records (the design section 3.6 step 1): our detached jobs and our
	// boards' children, nothing else. The output events are the hang/timeout
	// checkpoints (the deadline scan - no real timers in the plugin).
	// ------------------------------------------------------------------
	if (State.Wave.Jobs !== undefined) {
		State.Wave.Jobs.events.subscribe({ owners: "scope" }, (Event) => {
			try {
				if (!State.On) {
					return;
				}
				switch (Event.type) {
					case "settled": {
						Completion.OnSettled(State, Event, Append);
						// The wave-3 settle fold (appended): the monitors claim
						// their jobs FIRST - a member's monitor check is never a
						// board completion (the Board hook's skip guard backs
						// this up with the job kind).
						Monitors.OnSettled(State, Event, Append);
						Board.OnSettled(State, Event, Append);
						break;
					}
					default: {
						// The output/progress/registered events advance the
						// deadline scan (the hang + live-timeout checkpoints).
						Board.ScanDeadlines(State, Append);
						break;
					}
				}
			} catch (Error) {
				// Fail-open: a subscription error never reaches the dispatcher.
				try {
					Context.logger?.warn(
						`hook-dsh-live-containers: ${String(Error)}; the jobs event is skipped`,
					);
				} catch {
					/* logger optional */
				}
			}
		});
	}

	// ------------------------------------------------------------------
	// Listener L7: the session/event observer (emit mode, host scope - a host
	// listener sees every session's events and filters by content). Two
	// duties: (a) the report pickup (G5) - a child's send_message lands in
	// the parent's inbox and the splice event carries it; (b) the completion
	// delivery observer (I3 2.3) - the logged runtime-context snapshot is the
	// consume point for the pending batch.
	// ------------------------------------------------------------------
	if (WaveArmed)
		Context.on("session/event", (Subject, Event): void => {
			try {
				if (!State.On) {
					return;
				}
				const SessionEvent = Event as { type?: string; data?: unknown; seq?: number };
				// (b) The completion delivery (I3 2.3, consume-on-logged-snapshot).
				Completion.OnSessionEvent(State, Subject, SessionEvent as never, Append);
				// (a) The report pickup: an inbox splice with insertions whose text
				// matches the report grammar folds into the board.
				if (SessionEvent.type !== "agent/inbox/spliced") {
					return;
				}
				const Data = SessionEvent.data as
					{ inserted?: { content?: { type?: string; text?: string }[] }[] } | undefined;
				const Inserted = Data?.inserted;
				if (!Array.isArray(Inserted)) {
					return;
				}
				for (const Message of Inserted) {
					const Text = (Message?.content ?? [])
						.filter((Block) => Block?.type === "text")
						.map((Block) => Block?.text ?? "")
						.join("");
					const Match = /^\[live-report\]\s+(\S+)\s+(\S+)\s+(\S+)\s*([\s\S]*)$/.exec(
						Text,
					);
					if (Match === null) {
						// A parse miss is silently ignored (no ledger line per miss -
						// only a MATCHING report is folded).
						continue;
					}
					const PlantId = Match[1] ?? "";
					const MemberId = Match[2] ?? "";
					const Status = Match[3] ?? "";
					const Payload = Match[4] ?? "";
					// The board of the agent whose inbox spliced: the session's
					// agent id is derived from the subject's identity when exposed,
					// else the fold scans every board with this id (plant ids are
					// per-agent-keyed; a matching id is the fold target).
					let Folded = false;
					for (const [, Boards] of State.Boards) {
						const Board_ = Boards.get(PlantId);
						if (Board_ !== undefined) {
							Board.Report(State, Board_, MemberId, Status, Payload, Append);
							Folded = true;
						}
					}
					if (!Folded) {
						continue;
					}
				}
			} catch (Error) {
				// Fail-open: the observer never throws into the emit dispatch.
				try {
					Context.logger?.warn(
						`hook-dsh-live-containers: ${String(Error)}; the session event is skipped`,
					);
				} catch {
					/* logger optional */
				}
			}
		});

	// ------------------------------------------------------------------
	// The wave-2 tools: live_container_set (the per-agent state writer + the
	// accept/dismiss verbs) and live_plant (the board opener). The
	// registration is readonly after registration; the definitions are built
	// once here.
	// ------------------------------------------------------------------
	const Tools = (
		Context as unknown as { tools?: { register?: (definition: unknown) => () => void } }
	).tools;
	if (typeof Tools?.register === "function") {
		Tools.register(SetTool.default(State, Append));
		Tools.register(Plant.default(State, Append));
		// The wave-3 tools (appended): live_monitor (the enrollment surface)
		// and live_monitor_check (the deep-check path).
		Tools.register(MonitorTools.Monitor(State, Append));
		Tools.register(MonitorTools.Check(State, Append));
	}

	// ------------------------------------------------------------------
	// The completion dynamic context (the I3 carrier): one registered context
	// per apply, per-agent attribution through the assemble context's agent
	// field, withdrawal = absence.
	// ------------------------------------------------------------------
	const Prompt = (
		Context as unknown as { systemPrompt?: { context: (context: unknown) => () => void } }
	).systemPrompt;
	if (Prompt !== undefined && typeof Prompt.context === "function") {
		Completion.Register(State, Prompt as never);
	}

	// ==================================================================
	// THE WAVE-3 WIRING (the C3 extension - appended registrations only).
	// ==================================================================

	// ------------------------------------------------------------------
	// Listener L11: fs/observed (the enrollment + the version truth). The
	// registration rides the factory's Wire on the ROOT context (the governor
	// precedent) so every write the harness emits is heard. The arming gate
	// is the SAME one the wave-2 listeners use: the bare phase-1 fixture
	// (no services) mounts the phase-1 listener set unchanged, byte-for-byte;
	// in production `inject` guarantees ctx.jobs, so the gate is always open.
	// ------------------------------------------------------------------
	if (WaveArmed) {
		Factory.Wire(Context, State, (Target, Observation, Actor) =>
			Monitors.OnObserved(State, Target, Observation, Actor, Append),
		);
	}

	// ------------------------------------------------------------------
	// The wave-3 storage effect: the plugin's OWN P5-style monitor-domain
	// open (the factory Attach P5 arm shape). Best-effort and detached: an
	// ABSENT facility is a silent skip (the bands degrade to `not run yet`
	// after a restart), a PRESENT facility whose open fails is LOUD (one
	// ledger line, never rethrown); the disposer closes the handle.
	// ------------------------------------------------------------------
	Context.effect?.(() => {
		const Facility = Context.get?.("storageDomain") as
			Parameters<typeof Storage.default>[1] | undefined;
		switch (true) {
			case !!Facility: {
				void Storage.default(State, Facility, Append);
				return () => {
					const Domain = State.MonitorDomain;
					switch (true) {
						case !!Domain:
							void Domain.close().catch(() => {
								/* close best-effort */
							});
							break;
					}
				};
			}
			default:
				// Silent skip: nothing to open, nothing to close - and no queue
				// growth either (the pre-bind queue is dropped; the human
				// ledger remains the record).
				State.MonitorsQueue.length = 0;
				State.MonitorsJournal = () => {};
				State.MonitorsPersist = false;
				return () => {};
		}
	}, "hook-dsh-live-containers-monitors");

	// The loader ignores any return value; the smoke harness probes the built
	// State through this debug attachment instead.
	(Context as { __hookDshLiveContainersState?: State }).__hookDshLiveContainersState = State;
};
