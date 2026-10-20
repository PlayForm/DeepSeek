// Suggester - the CAN-5 mini-conversation suggester (I6 SUGGESTER-CONFIGURED;
// IMPLEMENTATION-DESIGN.md sections 2.6, 3.8, 4.5 as amended). The suggester
// does not suggest a template NAME; it suggests a CONFIGURED block: a one-shot
// detached subagent receives the request excerpt + the compressed catalog +
// the task facts, and returns a strict JSON suggestion carrying the template
// id and the opening variables (expectAgents / steps - the frozen v1 token
// grammar, I6 R1). The suggestion arrives AS A PLANTED BLOCK (the "plant"
// mode) or as the plain note (the "section" tier), and the main conversation
// accepts or dismisses it with a ONE-WORD command on live_container_set.
//
// PRIVACY (ratified): default "redact" for every route (the first 200 chars
// of the request plus its length); "verbatim" only by explicit config, with
// the SCHEME disclosure as the consent surface.
//
// CONTAINMENT: the suggestion runs DETACHED; a spawn/timeout/parse failure
// produces ONLY a ledger line, never a conversation artifact, never a retry
// within the same turn. With suggester "off" nothing spawns (the zero-subagent
// guarantee, provable by the smoke harness's spawn counter).
import Clock from "@Function/Clock.js";
import type { Log } from "@Function/Render.js";
import type { BoardState, Suggestion } from "@Interface/Events.js";
import type State from "@Interface/State.js";
import { Compressed, Entry } from "@Variable/Catalog.js";

/** The suggestion id grammar (I6 3.3): `sug-<4 hex>`, per-agent-keyed. */
export const NewID = (): string => {
	const Hex = Math.floor(Math.random() * 0x10000)
		.toString(16)
		.padStart(4, "0");
	return `sug-${Hex}`;
};

/** The skip words (I6 6.1): the user is driving manually. */
const SKIP_WORDS: readonly string[] = ["live container", "plant", "suggestion"];

/** The gate (I6 6.1, conjunctive): first user message of a turn AND length
 * >= suggestGateMinChars AND no skip word AND the rate cap allows it AND at
 * most one suggestion per user turn. */
export const Gate = (
	Agent: State,
	AgentID: string,
	Text: string,
	FirstOfTurn: boolean,
): boolean => {
	if (Agent.Suggester === "off") {
		return false;
	}
	if (!FirstOfTurn) {
		return false;
	}
	if (Text.length < Agent.SuggestGateMinChars) {
		return false;
	}
	const Lower = Text.toLowerCase();
	if (SKIP_WORDS.some((Word) => Lower.includes(Word))) {
		return false;
	}
	const Ticks = Agent.SuggesterTicks.get(AgentID);
	const Hour = Ticks?.ticks.filter((At) => Clock(Agent) - At < 3600000) ?? [];
	if (Hour.length >= Agent.MaxSuggestionsPerHour) {
		return false;
	}
	if (Ticks?.lastTurn === (Agent.TurnCounts.get(AgentID) ?? 0)) {
		return false;
	}
	return true;
};

/** The request excerpt (I6 section 2): "redact" sends the first 200 chars
 * plus the total length; "verbatim" forwards the whole excerpt capped at
 * maxPromptBytes. */
export const Excerpt = (Agent: State, Text: string): string => {
	if (Agent.SuggesterPrivacy === "verbatim") {
		return Text.length > Agent.MaxPromptBytes ? Text.slice(0, Agent.MaxPromptBytes) : Text;
	}
	if (Text.length <= 200) {
		return Text;
	}
	return `${Text.slice(0, 200)} [truncated, ${Text.length} chars]`;
};

/** The composed prompt (I6 section 2): the excerpt + the compressed catalog +
 * the task facts the plugin already holds. */
export const Compose = (Agent: State, AgentID: string, Text: string): string => {
	const Records = Agent.Detached.get(AgentID);
	let LiveJobs = 0;
	for (const Record of Records?.values() ?? []) {
		if (Record.status === undefined) {
			LiveJobs += 1;
		}
	}
	const Boards = Agent.Boards.get(AgentID);
	let OpenBoards = 0;
	for (const Board of Boards?.values() ?? []) {
		if (Board.lease.state === "open") {
			OpenBoards += 1;
		}
	}
	const Facts = `live jobs: ${LiveJobs}; open boards: ${OpenBoards}; turns: ${Agent.TurnCounts.get(AgentID) ?? 0}`;
	return [
		"Decide whether a live container block fits this request.",
		"Request excerpt:",
		Excerpt(Agent, Text),
		"Template catalog:",
		Compressed(Clock(Agent)),
		`Task facts: ${Facts}`,
		'Reply with strict JSON only: {"fit":"yes"|"no"|"unknown","templateId":"<catalog id>","rationale":"<= 240 bytes","tokens":{"expectAgents":<1..8>,"steps":["<step>",...]}} - omit tokens for templates that take none.',
	].join("\n");
};

/** Parse the mini-model's answer (I6 section 2): strict JSON; a parse
 * failure, a missing field, or an unknown templateId -> no suggestion. */
export interface ParsedSuggestion {
	fit: "yes" | "no" | "unknown";
	templateId: string;
	rationale: string;
	tokens?: { expectAgents?: number; steps?: string[] } | undefined;
}

export const Parse = (Output: unknown): ParsedSuggestion | undefined => {
	if (typeof Output !== "string") {
		return undefined;
	}
	const Start = Output.indexOf("{");
	const End = Output.lastIndexOf("}");
	if (Start < 0 || End <= Start) {
		return undefined;
	}
	try {
		const Raw = JSON.parse(Output.slice(Start, End + 1)) as Record<string, unknown>;
		const Fit = Raw["fit"];
		const TemplateID = Raw["templateId"];
		const Rationale = Raw["rationale"];
		if (typeof Fit !== "string" || !["yes", "no", "unknown"].includes(Fit)) {
			return undefined;
		}
		if (typeof TemplateID !== "string" || !Entry(TemplateID)) {
			return undefined;
		}
		if (typeof Rationale !== "string") {
			return undefined;
		}
		let Tokens: { expectAgents?: number; steps?: string[] } | undefined;
		const RawTokens = Raw["tokens"];
		if (RawTokens !== undefined && RawTokens !== null && typeof RawTokens === "object") {
			const Record = RawTokens as Record<string, unknown>;
			Tokens = {};
			if (typeof Record["expectAgents"] === "number") {
				Tokens.expectAgents = Record["expectAgents"];
			}
			if (Array.isArray(Record["steps"])) {
				Tokens.steps = (Record["steps"] as unknown[]).filter(
					(Step): Step is string => typeof Step === "string",
				);
			}
		}
		const Result: ParsedSuggestion = {
			fit: Fit as "yes" | "no" | "unknown",
			templateId: TemplateID,
			rationale: Rationale.slice(0, 240),
		};
		if (Tokens !== undefined) {
			Result.tokens = Tokens;
		}
		return Result;
	} catch {
		return undefined;
	}
};

/** Clamp the tokens to legal bounds (I6 3.2): the plugin never trusts the
 * mini-model; out-of-range or malformed tokens clamp to the nearest legal
 * value and each clamp is ledgered. Returns the clamped tokens. */
export const Clamp = (
	ID: string,
	TemplateID: string,
	Tokens: { expectAgents?: number; steps?: string[] } | undefined,
	Append: Log,
): { expectAgents?: number; steps?: string[] } => {
	const Catalog = Entry(TemplateID);
	const Clamped: { expectAgents?: number; steps?: string[] } = {};
	if (Catalog?.shape === "board") {
		const Raw = Tokens?.expectAgents;
		if (typeof Raw !== "number" || !Number.isFinite(Raw)) {
			Clamped.expectAgents = 1;
			Append(`suggestion clamped ${ID} expectAgents`);
		} else if (Raw < 1 || Raw > 8) {
			Clamped.expectAgents = Math.min(8, Math.max(1, Math.round(Raw)));
			Append(`suggestion clamped ${ID} expectAgents`);
		} else {
			Clamped.expectAgents = Math.round(Raw);
		}
	}
	if (Catalog?.shape === "list") {
		const Raw = Tokens?.steps ?? [];
		const Steps = Raw.filter((Step) => Step.length > 0).map((Step) =>
			Step.length > 64 ? Step.slice(0, 64) : Step,
		);
		if (Steps.length < 1) {
			Append(`suggestion clamped ${ID} steps`);
		}
		while (Steps.length > 8) {
			Steps.pop();
		}
		if (Steps.length === 0) {
			Steps.push("step-1");
			Append(`suggestion clamped ${ID} steps`);
		}
		Clamped.steps = Steps;
	}
	return Clamped;
};

/** Store a suggestion (the parse success path); the id is assigned by the
 * caller before the clamping. */
export const Store = (
	Agent: State,
	AgentID: string,
	ID: string,
	Parsed: ParsedSuggestion,
	Clamped: { expectAgents?: number; steps?: string[] },
	Append: Log,
): Suggestion => {
	const Suggestion_: Suggestion = {
		id: ID,
		agentId: AgentID,
		templateId: Parsed.templateId,
		fit: Parsed.fit,
		rationale: Parsed.rationale,
		tokens: Clamped,
		createdTurn: Agent.TurnCounts.get(AgentID) ?? 0,
		renderedTurn: undefined,
		withdrawn: false,
		planted: false,
	};
	const PerAgent = Agent.Suggestions.get(AgentID) ?? new Map<string, Suggestion>();
	PerAgent.set(ID, Suggestion_);
	Agent.Suggestions.set(AgentID, PerAgent);
	Append(`suggested ${ID} ${Parsed.templateId} (fit ${Parsed.fit})`);
	// autoPlant (I6 5.5): skip the preview frame and instantiate the suggestion
	// DIRECTLY as a DORMANT planted block.
	if (Agent.AutoPlant && Parsed.fit === "yes") {
		const Catalog = Entry(Parsed.templateId);
		const PlantType =
			Catalog?.shape === "board"
				? "agent-board"
				: Catalog?.shape === "list"
					? "todo-fill"
					: "custom";
		const Expect =
			Clamped.expectAgents ?? (Catalog?.shape === "list" ? (Clamped.steps?.length ?? 1) : 1);
		Suggestion_.planted = true;
		PlantDormant(
			Agent,
			AgentID,
			Suggestion_,
			PlantType as "agent-board" | "todo-fill" | "custom",
			Expect,
			Append,
		);
	}
	return Suggestion_;
};

/** The board module's Open, bound at registration (avoids a top-level import
 * cycle: Board imports nothing from Suggester). */
type BoardOpenFn = (
	Agent: State,
	AgentID: string,
	ID: string,
	PlantType: "agent-board" | "todo-fill" | "aggregate" | "custom",
	Expect: number,
	MemberIds: string[] | undefined,
	Template: string | undefined,
	Append: Log,
) => BoardState;
let BoardOpen: BoardOpenFn | undefined;

/** Bind the board module's Open (called once from Apply). */
export const BindBoard = (Open_: BoardOpenFn): void => {
	BoardOpen = Open_;
};

/** The dormant planted block (I6 5.5): the header carries the accept verb;
 * accept=<sid> activates it; dismiss=<sid> withdraws it. */
const PlantDormant = (
	Agent: State,
	AgentID: string,
	Suggestion_: Suggestion,
	PlantType: "agent-board" | "todo-fill" | "custom",
	Expect: number,
	Append: Log,
): void => {
	if (BoardOpen === undefined) {
		return;
	}
	const Board = BoardOpen(
		Agent,
		AgentID,
		`suggested-${Suggestion_.id}`,
		PlantType,
		Expect,
		undefined,
		undefined,
		Append,
	);
	Board.suggested = Suggestion_.id;
	Board.suggestionId = Suggestion_.id;
};

/** The spawn (I6 1.1): one detached one-shot subagent per qualifying turn on
 * the exploration strain's route. Failures produce ONLY a ledger line. */
export const Spawn = (
	Agent: State,
	AgentID: string,
	Text: string,
	Parent: { id: string },
	Append: Log,
): void => {
	const Subagent = Agent.Wave?.Subagent;
	if (Subagent === undefined) {
		Append("suggestion skipped (subagent unavailable)");
		return;
	}
	// The rate bookkeeping before the spawn (one suggestion per user turn).
	const Ticks = Agent.SuggesterTicks.get(AgentID) ?? { ticks: [], lastTurn: 0 };
	Ticks.ticks.push(Clock(Agent));
	Ticks.lastTurn = Agent.TurnCounts.get(AgentID) ?? 0;
	Agent.SuggesterTicks.set(AgentID, Ticks);
	const Controller = new AbortController();
	const Timer = setTimeout(
		() => Controller.abort(new Error("suggest timeout")),
		Agent.SuggestTimeoutMs,
	);
	if (typeof Timer === "object" && Timer !== null && "unref" in Timer) {
		(Timer as { unref: () => void }).unref();
	}
	const Prompt = Compose(Agent, AgentID, Text);
	try {
		const Activation = Subagent.startActivation({
			provider: Agent.SuggesterRoute.provider,
			label: "live-containers-suggester",
			request: { parent: Parent, prompt: Prompt },
			signal: Controller.signal,
			delivery: "caller",
		});
		void Activation.result
			.then(async (Result) => {
				clearTimeout(Timer);
				const Output = (Result as { output?: unknown }).output;
				const Text_ = Array.isArray(Output)
					? Output.map((Block) =>
							Block && typeof Block === "object" && "text" in Block
								? String((Block as { text?: unknown }).text ?? "")
								: "",
						).join("")
					: typeof Output === "string"
						? Output
						: undefined;
				const Parsed = Parse(Text_);
				if (Parsed === undefined) {
					Append("suggestion parse failed");
					return;
				}
				// The suggestion id is assigned BEFORE the clamping so each clamp
				// ledger line carries it (I6 A5).
				const ID = NewID();
				const Clamped = Clamp(ID, Parsed.templateId, Parsed.tokens, Append);
				Store(Agent, AgentID, ID, Parsed, Clamped, Append);
			})
			.catch(() => {
				Append("suggestion skipped (spawn failed)");
			});
	} catch (Err) {
		clearTimeout(Timer);
		Append(`suggestion skipped (${Err instanceof Error ? Err.message : String(Err)})`);
	}
};

/** The pre-step hook (the I6 6.1 trigger): evaluate the gate on a new user
 * message and spawn when it passes. Called from the L8 listener. */
export const OnUserMessage = (
	Agent: State,
	AgentID: string,
	Text: string,
	Parent: { id: string } | undefined,
	Append: Log,
): void => {
	try {
		if (Parent === undefined) {
			return;
		}
		if (!Gate(Agent, AgentID, Text, true)) {
			return;
		}
		Spawn(Agent, AgentID, Text, Parent, Append);
	} catch (Err) {
		try {
			Append(`suggestion skipped (${Err instanceof Error ? Err.message : String(Err)})`);
		} catch {
			/* even the ledger is best-effort */
		}
	}
};

/** The configured-block suggestion frame (I6 section 4, byte-exact). */
export const Frame = (Agent: State, Suggestion_: Suggestion, Separator: string): string => {
	const Catalog = Entry(Suggestion_.templateId);
	const Lines: string[] = [
		`${Separator} LIVE SUGGESTION ${Suggestion_.id} (template: ${Suggestion_.templateId}; configured) ${Separator}`,
	];
	if (Catalog?.shape === "board") {
		Lines.push(`expect agents: ${Suggestion_.tokens.expectAgents ?? 1}`);
	}
	if (Catalog?.shape === "list" && Suggestion_.tokens.steps !== undefined) {
		Lines.push("steps:");
		Suggestion_.tokens.steps.forEach((Step, Index) => Lines.push(`${Index + 1}. ${Step}`));
	}
	Lines.push(`lease: ${Agent.Plant.leaseTurns} turns (config default)`);
	Lines.push(`why: ${Suggestion_.rationale}`);
	Lines.push(`accept: live_container_set accept=${Suggestion_.id}`);
	Lines.push(`dismiss: live_container_set dismiss=${Suggestion_.id}`);
	Lines.push(`${Separator} END LIVE SUGGESTION ${Suggestion_.id} ${Separator}`);
	return Lines.join("\n");
};

/** The plain note (D2 4.5 verbatim, the "section" tier). */
export const PlainFrame = (Suggestion_: Suggestion, Separator: string): string =>
	[
		`${Separator} LIVE SUGGESTION (from a small helper model; act only if useful) ${Separator}`,
		`fit: ${Suggestion_.fit} | template: ${Suggestion_.templateId}`,
		`why: ${Suggestion_.rationale}`,
		`start it with: live_container_set plant=${Suggestion_.templateId} expect=${Suggestion_.tokens.expectAgents ?? 1}`,
		`${Separator} END LIVE SUGGESTION ${Separator}`,
	].join("\n");

/** The standing-section contribution for the suggestions of one agent (the
 * one-assembly window: render once, then withdraw with the expiry line). */
export const SectionBody = (
	Agent: State,
	AgentID: string,
	Separator: string,
	Append: Log,
): string => {
	const Parts: string[] = [];
	const PerAgent = Agent.Suggestions.get(AgentID);
	if (PerAgent === undefined) {
		return "";
	}
	const Turn = Agent.TurnCounts.get(AgentID) ?? 0;
	for (const [ID, Suggestion_] of [...PerAgent]) {
		if (Suggestion_.withdrawn) {
			continue;
		}
		if (Suggestion_.planted) {
			// The dormant block lives in the board frames, not here.
			continue;
		}
		if (Suggestion_.renderedTurn === undefined) {
			// The fit=no/unknown answers are observations, not frames (I6 6.2:
			// the answer consumes one rate slot and nothing else).
			if (Suggestion_.fit !== "yes") {
				continue;
			}
			Suggestion_.renderedTurn = Turn;
			Parts.push(
				Agent.Suggester === "plant"
					? Frame(Agent, Suggestion_, Separator)
					: PlainFrame(Suggestion_, Separator),
			);
			continue;
		}
		if (Turn > Suggestion_.renderedTurn) {
			// No action: the frame withdraws after one assembly (I6 5.3).
			Suggestion_.withdrawn = true;
			Append(`suggestion expired ${ID}`);
		}
	}
	return Parts.join("\n");
};

/** Accept one suggestion (I6 5.1): instantiate the stored, clamped
 * configuration verbatim. Returns the ledger line. */
export const Accept = (Agent: State, AgentID: string, ID: string, Append: Log): string => {
	const PerAgent = Agent.Suggestions.get(AgentID);
	const Suggestion_ = PerAgent?.get(ID);
	if (Suggestion_ === undefined || Suggestion_.withdrawn) {
		return `accept failed ${ID} (expired)`;
	}
	const Catalog = Entry(Suggestion_.templateId);
	const PlantType =
		Catalog?.shape === "board"
			? "agent-board"
			: Catalog?.shape === "list"
				? "todo-fill"
				: "custom";
	const Expect =
		Suggestion_.tokens.expectAgents ??
		(Catalog?.shape === "list" ? (Suggestion_.tokens.steps?.length ?? 1) : 1);
	if (Suggestion_.planted) {
		// Activate the dormant block (open the lease, start expecting reports).
		const Boards = Agent.Boards.get(AgentID);
		const Dormant = [...(Boards?.values() ?? [])].find((Board) => Board.suggestionId === ID);
		if (Dormant !== undefined) {
			Dormant.suggested = undefined;
		}
		Suggestion_.withdrawn = true;
		return `suggestion accepted ${ID} (${Suggestion_.templateId})`;
	}
	if (BoardOpen === undefined) {
		return `accept failed ${ID} (expired)`;
	}
	BoardOpen(
		Agent,
		AgentID,
		`planted-${ID}`,
		PlantType as "agent-board" | "todo-fill" | "aggregate" | "custom",
		Expect,
		undefined,
		undefined,
		Append,
	);
	if (PlantType === "todo-fill" && Suggestion_.tokens.steps !== undefined) {
		const Boards = Agent.Boards.get(AgentID);
		const Board = Boards?.get(`planted-${ID}`);
		if (Board !== undefined) {
			Board.items = Suggestion_.tokens.steps.map((Step) => ({
				label: Step,
				state: "todo" as const,
				by: undefined,
				at: undefined,
			}));
		}
	}
	Suggestion_.withdrawn = true;
	return `suggestion accepted ${ID} (${Suggestion_.templateId})`;
};

/** Dismiss one suggestion (I6 5.2/5.3/5.5): the frame or dormant block
 * withdraws with the distinct ledger line. */
export const Dismiss = (
	Agent: State,
	AgentID: string,
	ID: string,
	Reason: string | undefined,
	Append: Log,
): string => {
	const PerAgent = Agent.Suggestions.get(AgentID);
	const Suggestion_ = PerAgent?.get(ID);
	if (Suggestion_ !== undefined && !Suggestion_.withdrawn) {
		Suggestion_.withdrawn = true;
		if (Suggestion_.planted) {
			const Boards = Agent.Boards.get(AgentID);
			for (const [BoardID, Board] of Boards ?? []) {
				if (Board.suggestionId === ID) {
					Boards?.delete(BoardID);
				}
			}
			Append(`suggestion dismissed ${ID} (dormant)`);
			return `suggestion dismissed ${ID} (dormant)`;
		}
	}
	const Line =
		Reason === undefined
			? `suggestion dismissed ${ID}`
			: `suggestion dismissed ${ID} (${Reason})`;
	Append(Line);
	return Line;
};
