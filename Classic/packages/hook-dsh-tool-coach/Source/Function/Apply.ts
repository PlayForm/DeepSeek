// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the durable
// activation proof, and the FIVE listeners of the coaching ladder (plan Part
// 3 §3.2 + Part 4 §4.1):
//
//   1. tools/post-execute  (waterfall, plain ctx.on - AFTER the CCR
//      {prepend:true} listener and normalize's post-execute, since plain
//      registration order guarantees it; detection is order-independent
//      because exec is immutable): tier 0 ledger + tier 1 note + tier 2
//      strike accounting;
//   2. tools/pre-execute   (waterfall, plain ctx.on, registered
//      unconditionally, no-op unless enforce != "off"): tier 3 deny;
//   3. agent/pre-step      (plain): the user-message reset of the chain
//      (repeat-tool-reminder precedent);
//   4. system-prompt/assemble (waterfall, after next(), append-only): the
//      tier-2 persistent section, TTL-rebuilt, cache-invalidated on
//      tools/change;
//   5. tools/change        (emit): tier-2 section-cache invalidation only.
//
// THE WATERFALL DISCIPLINE: `next()` is ALWAYS awaited first; pass-through
// returns the downstream decision unchanged; FAIL-OPEN: every listener body
// is one try/catch - on any error a logger.warn records it and the downstream
// result is returned UNCHANGED. A note never fails a waterfall.
//
// NOT factory machinery, deliberately: no fs/observed Wire, no Attach, no
// factory Schema - the coach owns its schema (Variable/Config) and its
// strings. The function returns NOTHING; test probes read the state through
// the `ctx.__hookDshToolCoachState` attachment.
//
// `inject: ["pluginFactory", "tools"]` (Library.ts) - the factory provides
// the State builder + the ledger; `tools` provides the live registry fetch
// (ctx.tools.schemas(), plan Part 3 §3.1).
import type { Context } from "@deepseek-ai/cordis";
// The type-only imports below publish the EVENT signatures on the cordis
// Events interface (the packages' own augmentations): dsh-tools declares the
// tools/* waterfalls + tools/change (and transitively dsh-agent's
// agent/pre-step), dsh-system-prompt declares system-prompt/assemble.
import type { ToolSchema } from "@deepseek-ai/dsh-llm";
import type { AssembleContext, PromptAssembly } from "@deepseek-ai/dsh-system-prompt";
import type {
	PostToolDecision,
	PreToolDecision,
	ToolExecution,
	ToolExecutionResult,
} from "@deepseek-ai/dsh-tools";
import * as Compose from "@Function/Compose.js";
import Count, { FreshState } from "@Function/Count.js";
import Detect from "@Function/Detect.js";
import Enforce from "@Function/Enforce.js";
import Fetch, { StaticCatalog } from "@Function/Fetch.js";
import BuildNote, { Prepend } from "@Function/Note.js";
import type Config from "@Interface/Config.js";
import type { AgentState, CoachRow, Decision, Detection } from "@Interface/Execution.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/hook-dsh-core";
import { DEFAULT_EXEMPTS, DEFAULT_PATTERNS } from "@Variable/Patterns.js";

// The bundle version, mirrored from package.json (the activation proof's
// first field; a release bumps both together).
const Version = "0.1.0";

/** The tools-service surface the coach needs (structural view). */
interface ToolsService {
	schemas: () => ToolSchema[];
}

/** Unwrap one possibly-volatile config cell (`{ get }` reference or value). */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

/** Whether the config's pattern table is the untouched default. */
const IsDefaultRows = (Rows: CoachRow[]): boolean =>
	Rows.length === DEFAULT_PATTERNS.length &&
	Rows.every((Row, Index) => Row.pattern === DEFAULT_PATTERNS[Index]?.pattern);

/** The fail-loud validation (plan Part 3 §3.4 + TOOL-COACH-PLAN.md §3). */
const Validate = (Options: unknown): void => {
	const Raw = (Options ?? {}) as Record<string, unknown>;
	const Numeric = (Key: string): number => Number(Cell(Raw[Key]));
	const Fail = (Message: string): never => {
		throw new Error(`hook-dsh-tool-coach: ${Message}`);
	};
	if (!(Numeric("threshold") >= 1)) {
		Fail("threshold must be >= 1");
	}
	if (!(Numeric("window") >= Numeric("threshold"))) {
		Fail("window must be >= threshold");
	}
	if (!(Numeric("cooldown") >= 1)) {
		Fail("cooldown must be >= 1");
	}
	if (!(Numeric("escalateThreshold") >= Numeric("threshold"))) {
		Fail("escalateThreshold must be >= threshold");
	}
	if (!(Numeric("cleanWindow") >= 1)) {
		Fail("cleanWindow must be >= 1");
	}
	if (!(Numeric("enforceThreshold") >= 1)) {
		Fail("enforceThreshold must be >= 1");
	}
	if (!["off", "write", "all"].includes(String(Cell(Raw["enforce"])))) {
		Fail('enforce must be one of "off" | "write" | "all"');
	}
	if (!(Numeric("maxSectionTools") >= 1 && Numeric("maxSectionTools") <= 24)) {
		Fail("maxSectionTools must be between 1 and 24");
	}
	if (!(Numeric("sectionTtl") >= 1)) {
		Fail("sectionTtl must be >= 1");
	}
	const Judge = Cell(Raw["judgeTools"]);
	if (!Array.isArray(Judge) || Judge.length === 0) {
		Fail("judgeTools must be a non-empty array of terminal tool names");
	}
	const Exempts = Cell(Raw["exemptPatterns"]);
	if (Array.isArray(Exempts)) {
		for (const Pattern of Exempts) {
			try {
				new RegExp(String(Pattern));
			} catch {
				Fail(`exemptPatterns entry does not compile as a RegExp: ${String(Pattern)}`);
			}
		}
	}
	const Rows = Cell(Raw["patternTable"]) as CoachRow[] | undefined;
	if (Array.isArray(Rows)) {
		const Prefix = IsDefaultRows(Rows);
		const UserRows = Prefix ? Rows.slice(DEFAULT_PATTERNS.length) : Rows;
		for (const Row of UserRows) {
			if (!Row || typeof Row.pattern !== "string" || Row.pattern.length === 0) {
				Fail("every patternTable row needs a non-empty pattern");
			}
			if (!Row.tool || typeof Row.tool !== "string") {
				Fail("every patternTable row needs a non-empty tool");
			}
			try {
				new RegExp(Row.pattern);
			} catch {
				Fail(`patternTable row does not compile as a RegExp: ${Row.pattern}`);
			}
			if (DEFAULT_PATTERNS.some((Default) => Default.pattern === Row.pattern)) {
				Fail(`patternTable row duplicates a built-in pattern: ${Row.pattern}`);
			}
		}
	}
	const Notes = Cell(Raw["notes"]) as Record<string, unknown> | undefined;
	if (Notes && typeof Notes === "object") {
		for (const Key of ["first", "persistent", "denied"]) {
			if (typeof Notes[Key] !== "string" || (Notes[Key] as string).length === 0) {
				Fail(`notes.${Key} must be a non-empty template string`);
			}
		}
	}
};

/** Extract the command string from a terminal tool call's arguments. */
const CommandOf = (Arguments: unknown): string => {
	if (
		Arguments &&
		typeof Arguments === "object" &&
		typeof (Arguments as Record<string, unknown>)["command"] === "string"
	) {
		return (Arguments as Record<string, unknown>)["command"] as string;
	}
	return JSON.stringify(Arguments ?? {});
};

export default (Context: Context, Options: Config): void => {
	// Fail-loud validation BEFORE the State build: invalid config throws at
	// load, never silently defaults (the repeat-tool-reminder precedent).
	Validate(Options);

	// The injected factory service (typed via Interface/Factory's augmentation).
	const Factory = Context.pluginFactory;

	// The State: the factory's shared shape plus the coach's own fields,
	// copied from the (cell-unwrapped) validated config by the setup map.
	// Every mapped field is volatile in the schema, so the factory's P10
	// loader/volatile-update listener refreshes them IN PLACE - a flip
	// (enabled, enforce, threshold, fetchLive, ...) lands on the next judged
	// call without a remount.
	const State: State = Factory.State<State>(Context, Options, {
		module: "hook-dsh-tool-coach",
		fields: {
			On: "enabled",
			Judge: "judgeTools",
			Threshold: "threshold",
			Window: "window",
			Cooldown: "cooldown",
			Escalate: "escalateThreshold",
			Clean: "cleanWindow",
			Enforce: "enforce",
			EnforceThreshold: "enforceThreshold",
			Exempt: "exemptPatterns",
			Patterns: "patternTable",
			Notes: "notes",
			FetchLive: "fetchLive",
			MaximumSectionTools: "maxSectionTools",
			SectionTtl: "sectionTtl",
		},
	});
	State.Factory = Factory;
	State.Agents = new WeakMap();
	State.Registry = new Set();

	// The effective rows: the built-in defaults, with the user's rows
	// APPENDED after them (plan Part 2 §2.6); an untouched default table is
	// used as-is.
	const Rows = (): CoachRow[] => {
		const Configured = Array.isArray(State.Patterns) ? State.Patterns : [];
		if (Configured.length === 0) {
			return []; // an emptied pattern table = N=0 passthrough (plan §5)
		}
		return IsDefaultRows(Configured) ? DEFAULT_PATTERNS : [...DEFAULT_PATTERNS, ...Configured];
	};
	// The effective exemptions: built-in defaults + the user's, deduped.
	const Exempts = (): string[] => [
		...new Set([...DEFAULT_EXEMPTS, ...(Array.isArray(State.Exempt) ? State.Exempt : [])]),
	];

	// The per-agent state (WeakMap keyed on the Agent object, like the
	// repeat-tool-reminder's chains). A call without an agent shares the
	// module's default key, so offenses are still counted and noted.
	const DefaultKey: object = {};
	const Agent = (Key: unknown): AgentState => {
		const Object_ = (Key as object) ?? DefaultKey;
		let AgentState = State.Agents.get(Object_);
		if (!AgentState) {
			AgentState = FreshState();
			State.Agents.set(Object_, AgentState);
			State.Registry.add(AgentState);
		}
		return AgentState;
	};

	// The live catalog fetch (per note, plan Part 3 §3.1): tier 1/3 fetch
	// right before composing; failure degrades to the static table. With
	// fetchLive off, the static catalog is used unconditionally and no
	// fetch-failure line is ever logged.
	const Catalog = () =>
		State.FetchLive
			? Fetch(Context.tools as ToolsService, (Message: string) =>
					Factory.Append(State, Message),
				)
			: StaticCatalog();

	// Whether a call is judged: only the configured terminal tools.
	const Judged = (Name: string): boolean =>
		Array.isArray(State.Judge) && State.Judge.includes(Name);

	// The mapped tools for the tier-2 table: the effective rows' tool names in
	// the plan's class priority order (write, read, search, discovery,
	// control), then first appearance within a class.
	const Mapped = (): string[] => {
		const Order = ["write", "read", "search", "discovery", "control"];
		const Names: string[] = [];
		for (const Class of Order) {
			for (const Row of Rows()) {
				if (Row.class === Class && !Names.includes(Row.tool)) {
					Names.push(Row.tool);
				}
			}
		}
		return Names;
	};

	// Durable activation proof - "did it activate" must be answerable from the
	// ledger alone (the master switch and the ladder's knobs on the line).
	if (!State.On) {
		Factory.Append(State, "disabled (enabled=false)");
	} else {
		Factory.Append(
			State,
			Activate([
				["", `bundle ${Version}`],
				["threshold", `${State.Threshold}/${State.Window}`],
				["cooldown", String(State.Cooldown)],
				["escalate", String(State.Escalate)],
				["clean", String(State.Clean)],
				["enforce", `${State.Enforce}@${State.EnforceThreshold}`],
				["judge", State.Judge.join(",")],
				["fetch", State.FetchLive ? "live" : "static"],
			]),
		);
	}

	// ------------------------------------------------------------------
	// Listener 1: tools/post-execute (tier 0 ledger, tier 1 note, tier 2
	// strike accounting). Plain registration - runs AFTER the CCR
	// {prepend:true} listener and normalize's post-execute.
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
				if (!State.On || !Judged(Exec.name)) {
					return Downstream;
				}
				const Command = CommandOf(Exec.arguments);
				const Detection: Detection = Detect(Command, Rows(), Exempts());
				const AgentState = Agent(Exec.agent);
				// Tier 0: the offense ledger line, and the exempt line (only for
				// a would-be offense, at most once per distinct pattern per agent).
				if (Detection?.kind === "exempt") {
					if (!AgentState.exemptSeen.has(Detection.pattern)) {
						AgentState.exemptSeen.add(Detection.pattern);
						Factory.Append(State, `exempt ${Exec.name} ${Detection.pattern}`);
					}
					return Downstream;
				}
				const Decision = Count(
					AgentState,
					Detection?.kind === "offense" ? Detection.match : null,
					{
						threshold: State.Threshold,
						window: State.Window,
						cooldown: State.Cooldown,
						escalateThreshold: State.Escalate,
						cleanWindow: State.Clean,
					},
				);
				if (Decision.match) {
					Factory.Append(
						State,
						`offense ${Exec.name} ${Decision.match.class} ${Decision.match.pattern}`,
					);
				}
				// Tier 1: the labeled notice, prepended to the downstream contexts.
				if (Decision.note && Decision.match) {
					Factory.Append(
						State,
						`strike ${Decision.strikes}/${State.Threshold} ${Exec.name} ${Decision.match.class} -> note ${Decision.match.tool}`,
					);
					const Text = Compose.First(Decision, Catalog(), State.Notes.first);
					const Note = BuildNote(
						Text,
						`${Exec.name} ${Decision.match.class} × ${Decision.strikes}`,
					);
					if (Downstream.kind === "block") {
						return {
							kind: "block",
							feedback: Downstream.feedback,
							additionalContexts: Prepend(Note, Downstream.additionalContexts),
						};
					}
					return {
						...Downstream,
						additionalContexts: Prepend(Note, Downstream.additionalContexts),
					};
				}
				if (Decision.suppressed) {
					Factory.Append(
						State,
						`cooldown suppressed ${Decision.strikes} ${Exec.name} ${Decision.match?.class ?? ""}`,
					);
				}
				if (Decision.tier2On) {
					Factory.Append(
						State,
						`escalated persistent section (${Decision.strikes} strikes)`,
					);
				}
				if (Decision.tier2Off) {
					Factory.Append(
						State,
						`persistent section cleared (${State.Clean} clean calls)`,
					);
				}
				return Downstream;
			} catch (Error) {
				// Fail-open: never throw into the waterfall.
				try {
					Context.logger?.warn(
						`hook-dsh-tool-coach: ${String(Error)}; the call passes through uncoached`,
					);
				} catch {
					/* logger optional */
				}
				return Downstream;
			}
		},
	);

	// ------------------------------------------------------------------
	// Listener 2: tools/pre-execute (tier 3 deny). Registered
	// unconditionally; no-op unless enforce != "off" (read live each call).
	// ------------------------------------------------------------------
	Context.on(
		"tools/pre-execute",
		async (
			Exec: ToolExecution,
			Next: () => Promise<PreToolDecision>,
		): Promise<PreToolDecision> => {
			// next() FIRST: the downstream listeners settle before any decision.
			const Downstream = await Next();
			try {
				if (!State.On || State.Enforce === "off" || !Judged(Exec.name)) {
					return Downstream;
				}
				const Command = CommandOf(Exec.arguments);
				const Detection = Detect(Command, Rows(), Exempts());
				if (Detection?.kind !== "offense") {
					return Downstream;
				}
				const AgentState = Agent(Exec.agent);
				const Fires = Enforce(AgentState, Detection.match, {
					enforce: State.Enforce,
					enforceThreshold: State.EnforceThreshold,
				});
				if (!Fires) {
					return Downstream;
				}
				const Pseudo: Decision = {
					match: Detection.match,
					tier: 3,
					note: false,
					tier2On: false,
					tier2Off: false,
					suppressed: false,
					strikes: 0,
					sinceNote: 0,
				};
				const Reason = Compose.Denied(Pseudo, Catalog(), State.Notes.denied);
				Factory.Append(
					State,
					`denied ${Exec.name} ${Detection.match.class} ${Detection.match.pattern} -> use ${Detection.match.tool}`,
				);
				return { kind: "deny", reason: Reason };
			} catch (Error) {
				// Fail-open: a broken deny must never break the call either.
				try {
					Context.logger?.warn(
						`hook-dsh-tool-coach: ${String(Error)}; the call is allowed`,
					);
				} catch {
					/* logger optional */
				}
				return Downstream;
			}
		},
	);

	// ------------------------------------------------------------------
	// Listener 3: agent/pre-step (the user-message reset). Mirrors the
	// repeat-tool-reminder's chain reset: a new user message clears the
	// agent's counters, while the tier-2 section (and its cache) persist -
	// its exit condition is the clean window, not the conversation boundary.
	// ------------------------------------------------------------------
	Context.on("agent/pre-step", async (Payload, Next) => {
		// next() FIRST: the downstream listeners settle before any decision.
		const Downstream = await Next();
		try {
			const Step = Payload as {
				agent?: unknown;
				messages?: { source?: { kind?: string } }[];
			};
			if (
				Array.isArray(Step.messages) &&
				Step.messages.some((M) => M?.source?.kind === "user")
			) {
				const AgentState = Agent(Step.agent);
				AgentState.window = [];
				AgentState.sinceNote = Number.MAX_SAFE_INTEGER;
				AgentState.strikesSinceNote = 0;
				AgentState.classStrikes = {
					write: 0,
					read: 0,
					search: 0,
					discovery: 0,
					control: 0,
				};
				AgentState.sinceClean = 0;
			}
		} catch (Error) {
			// Fail-open: the reset never breaks a step.
			try {
				Context.logger?.warn(`hook-dsh-tool-coach: ${String(Error)}; the reset is skipped`);
			} catch {
				/* logger optional */
			}
		}
		return Downstream;
	});

	// ------------------------------------------------------------------
	// Listener 4: system-prompt/assemble (the tier-2 persistent section).
	// After next(): the coach appends ONE markdown section to the
	// downstream assembly and returns it otherwise unchanged - the returned
	// assembly is authoritative, so the coach touches nothing else
	// (preserving PTC mode and structured-output contributions).
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
				const AgentState = Agent(AssembleContext?.agent);
				if (!AgentState.tier2) {
					return Downstream;
				}
				// The cache: rebuilt when sectionTtl judged calls elapsed (the
				// tools/change listener clears it for the other rebuild path).
				const Stale =
					!AgentState.sectionCache ||
					AgentState.calls - AgentState.sectionCache.built >= State.SectionTtl;
				if (Stale) {
					const Rebuilt = AgentState.sectionCache !== undefined;
					const Live = Catalog();
					AgentState.sectionCache = {
						built: AgentState.calls,
						text: Compose.Persistent(
							AgentState,
							Live,
							State.Notes.persistent,
							{ maxSectionTools: State.MaximumSectionTools },
							Mapped(),
							[...Live.tools.keys()],
						),
					};
					if (Rebuilt) {
						Factory.Append(State, `section rebuilt (ttl ${State.SectionTtl})`);
					}
				}
				const Text = AgentState.sectionCache?.text ?? "";
				return {
					...Downstream,
					sections: [...Downstream.sections, { name: "hook-dsh-tool-coach", text: Text }],
				};
			} catch (Error) {
				// Fail-open: the section never breaks an assembly.
				try {
					Context.logger?.warn(
						`hook-dsh-tool-coach: ${String(Error)}; the assembly passes through`,
					);
				} catch {
					/* logger optional */
				}
				return Downstream;
			}
		},
	);

	// ------------------------------------------------------------------
	// Listener 5: tools/change (the tier-2 cache invalidation). Emit mode:
	// clears every live agent's section cache so the next assembly rebuilds
	// it from the NEW registry.
	// ------------------------------------------------------------------
	Context.on("tools/change", (): void => {
		try {
			if (!State.On) {
				return;
			}
			let Cleared = false;
			for (const AgentState of State.Registry) {
				if (AgentState.tier2 && AgentState.sectionCache) {
					AgentState.sectionCache = undefined;
					Cleared = true;
				}
			}
			if (Cleared) {
				Factory.Append(State, "section rebuilt (tools/change)");
			}
		} catch (Error) {
			try {
				Context.logger?.warn(`hook-dsh-tool-coach: ${String(Error)}; the cache survives`);
			} catch {
				/* logger optional */
			}
		}
	});

	// The loader ignores any return value; the smoke harness probes the built
	// State through this debug attachment instead.
	(Context as { __hookDshToolCoachState?: State }).__hookDshToolCoachState = State;
};
