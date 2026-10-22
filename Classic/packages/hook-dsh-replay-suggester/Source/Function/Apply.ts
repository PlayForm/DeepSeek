// Apply - the plugin entry function, a THIN MODULE WIRE-UP in the factory
// family's shape: build the State through `Factory.State`, emit the durable
// activation proof, load the history store ONCE (boot path), compile the
// pack ONCE, and register the hook's OWN listeners. The replay-suggester's
// special step: the Repeat intent RESOLVES through the recalled history
// record - the candidates are the files touched last time, and the note's
// caveat line names the command that verified. Without a record the hook
// ABSTAINS (`replay no-memory`): a replay answer without a record is a
// guess, and the plan forbids the guess (§2.4).
//
//   1. tools/post-execute (waterfall, plain ctx.on): next() first, detect,
//      gate, recall, and prepend ONE additionalContexts notice. Never
//      replaces content.
//   2. agent/pre-step (waterfall, plain): the per-turn reset of the
//      per-turn note counter when a user message enters.
//
// THE WATERFALL DISCIPLINE (the ccr/tool-coach precedent, live-verified):
//   * `next()` is ALWAYS awaited FIRST, before any decision;
//   * pass-through is `return decision` unchanged;
//   * FAIL-OPEN: every listener body is one try/catch - on any error a
//     logger.warn records it and the downstream decision is returned
//     UNCHANGED. A note never fails a tool call.
//
// `inject: ["pluginFactory"]` (Library.ts) - the factory is a REQUIRED
// service (the State builder + the ledger); the loader's PENDING state
// handles the ordering. The function returns NOTHING.
import type { Context } from "@deepseek-ai/cordis";
import type { PostToolDecision, ToolExecution } from "@deepseek-ai/dsh-tools";
import type Config from "@Interface/Config.js";
import type { ReplayRecord } from "@Interface/History.js";
import type { Candidate } from "@Interface/Pack.js";
import type { AgentMemory } from "@Interface/State.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/lib-dsh-core";
import Defaults from "@Variable/Defaults.js";

import Detect, { Compile } from "./Detect.js";
import History, { LIFT, Recall } from "./History.js";
import BuildNote, { Prepend } from "./Note.js";

// The bundle version, mirrored from package.json (the activation proof's
// first field; a release bumps both together).
const Version = "0.1.0";

/** Fresh per-agent memory. */
const FreshMemory = (): AgentMemory => ({
	Calls: 0,
	Noted: new Map(),
	TurnNotes: 0,
	Ring: [],
});

export default (Context: Context, Options: Config): void => {
	// The injected factory service (typed via Interface/Factory's Context
	// augmentation; guaranteed present by the inject declaration).
	const Factory = Context.pluginFactory;
	// The State: the factory's shared shape plus the hook's own fields,
	// copied from the (cell-unwrapped) validated config by the setup map.
	const State: State = Factory.State<State>(Context, Options, {
		module: "replay-suggester",
		fields: {
			On: "enabled",
			Threshold: "threshold",
			MaxCandidates: "maxCandidates",
			MaxNoteChars: "maxNoteChars",
			Cooldown: "cooldownCalls",
			MaxNotesPerTurn: "maxNotesPerTurn",
			Intents: "intents",
			EmitOn: "emitOn",
			Exclude: "exclude",
			HistoryPath: "historyPath",
			LearnWindow: "learnWindow",
		},
	});
	State.Factory = Factory;
	State.Agents = new WeakMap();

	// The history store, read ONCE at apply (boot path, not hot path). The
	// load outcome lands in the ledger; a missing or corrupt store degrades
	// to silence, never a throw.
	State.Records = History(State.HistoryPath, (Line: string) => Factory.Append(State, Line));

	// The compiled pack, built ONCE at apply (boot path, not hot path).
	const Enabled = State.Intents.length > 0 ? new Set(State.Intents) : undefined;
	State.Rules = Compile(
		Defaults.intents
			.filter((Intent) => Enabled === undefined || Enabled.has(Intent.id))
			.map((Intent) => ({
				...Intent,
				threshold: Math.max(Intent.threshold, State.Threshold),
			})),
	);

	// The per-agent state (WeakMap keyed on the Agent object, the tool-coach
	// precedent). A call without an agent shares the module's default key.
	const DefaultKey: object = {};
	const Agent = (Key: unknown): AgentMemory => {
		const Object_ = (Key as object) ?? DefaultKey;
		let Memory = State.Agents.get(Object_);
		if (!Memory) {
			Memory = FreshMemory();
			State.Agents.set(Object_, Memory);
		}
		return Memory;
	};

	// Durable activation proof - "did it activate" must be answerable from the
	// ledger alone.
	if (!State.On) {
		Factory.Append(State, "disabled (enabled=false)");
	} else {
		Factory.Append(
			State,
			Activate([
				["", `bundle ${Version}`],
				["", `intents ${State.Rules.length}`],
				["", `threshold ${State.Threshold}`],
				["", `history ${State.Records.length}`],
			]),
		);
	}

	// Whether a call is judged: only the configured tool names.
	const Judged = (Name: string): boolean =>
		Array.isArray(State.EmitOn) && State.EmitOn.includes(Name);

	// A candidate is dropped when its path sits under one of the exclude
	// prefixes (Target/, node_modules, ...).
	const Excluded = (Path: string): boolean =>
		(State.Exclude ?? []).some((Prefix) => Prefix.length > 0 && Path.includes(Prefix));

	// The note text: the intent header, the recalled record's touched files
	// (capped), and the verification command as the caveat line - bound to
	// maxNoteChars.
	const Text = (
		IntentId: string,
		Record: ReplayRecord,
		Targets: Candidate[],
		K: number,
	): string => {
		const Header = `[replay-suggester] intent=${IntentId} confidence=${K.toFixed(2)}`;
		const Lines = Targets.map((Target) => `- ${Target.path} - ${Target.reason}`);
		const Caveat =
			Record.verify.length > 0
				? `note: last time verified with ${Record.verify}`
				: `note: ${Defaults.intents[0]?.note ?? "the recall is the answer"}`;
		const Full = `${Header}\ntargets (${Targets.length}):\n${[...Lines, Caveat].join("\n")}`;
		if (Full.length <= State.MaxNoteChars) {
			return Full;
		}
		return `${Full.slice(0, State.MaxNoteChars - 1)}...`;
	};

	// The gate: cooldown, per-turn cap. Every refusal is a ledger line.
	const Gate = (Memory: AgentMemory, IntentId: string): "emit" | "cooldown" | "cap" => {
		const Last = Memory.Noted.get(IntentId);
		if (Last !== undefined && Memory.Calls - Last < State.Cooldown) {
			return "cooldown";
		}
		if (Memory.TurnNotes >= State.MaxNotesPerTurn) {
			return "cap";
		}
		return "emit";
	};

	// Listener 1: tools/post-execute - the note. Plain registration: runs
	// AFTER the ccr's {prepend:true} listener and normalize's post-execute,
	// and never replaces content (only additionalContexts).
	Context.on(
		"tools/post-execute",
		async (Exec: ToolExecution, _Result: unknown, Next: () => Promise<PostToolDecision>) => {
			// next() FIRST: the downstream listeners settle before any decision.
			const Decision = await Next();
			try {
				if (!State.On || !Judged(Exec.name)) {
					return Decision;
				}
				const Memory = Agent(Exec.agent);
				Memory.Calls += 1;
				// The probe: the tool name plus the arguments JSON.
				const Probe = `${Exec.name} ${JSON.stringify(Exec.arguments ?? {})}`;
				Memory.Ring.unshift(Probe);
				Memory.Ring.length = Math.min(Memory.Ring.length, 8);
				// The recall happens BEFORE detection: it is the history signal
				// (the lift) that lets the Repeat intent cross the gate.
				const Record = Recall(State.Records, Probe);
				const Match = Detect(
					State.Rules,
					Exec.name,
					Probe,
					Record === undefined ? 0 : LIFT,
				);
				if (Match === null) {
					return Decision;
				}
				const Verdict = Gate(Memory, Match.intent.id);
				if (Verdict !== "emit") {
					Factory.Append(State, `suppressed ${Verdict} ${Match.intent.id}`);
					return Decision;
				}
				// Resolve: the Repeat intent resolves ONLY through the record.
				if (Record === undefined) {
					Factory.Append(
						State,
						`abstained no-memory ${Match.intent.id} ${Match.k.toFixed(2)}`,
					);
					return Decision;
				}
				const Targets: Candidate[] = Record.files
					.filter((File) => !Excluded(File))
					.slice(0, State.MaxCandidates)
					.map((File) => ({
						path: File,
						reason: `touched last time (${Record.intent})`,
						prior: 1.0,
					}));
				if (Targets.length === 0) {
					Factory.Append(
						State,
						`abstained ambiguous ${Match.intent.id} ${Match.k.toFixed(2)}`,
					);
					return Decision;
				}
				Memory.Noted.set(Match.intent.id, Memory.Calls);
				Memory.TurnNotes += 1;
				Factory.Append(
					State,
					`suggest ${Match.intent.id} ${Match.k.toFixed(2)} ${Targets.length} candidates call ${Exec.name}`,
				);
				const Note = BuildNote(
					Text(Match.intent.id, Record, Targets, Match.k),
					`${Match.intent.id} ${Match.k.toFixed(2)}`,
				);
				if (Decision.kind === "block") {
					return {
						kind: "block",
						feedback: Decision.feedback,
						additionalContexts: Prepend(Note, Decision.additionalContexts),
					};
				}
				return {
					...Decision,
					additionalContexts: Prepend(Note, Decision.additionalContexts),
				};
			} catch (Error) {
				// Fail-open: keep the downstream decision, warn, never throw into
				// the waterfall.
				try {
					Context.logger?.warn(`replay-suggester: ${String(Error)}; the note is skipped`);
				} catch {
					/* logger optional */
				}
				return Decision;
			}
		},
	);

	// Listener 2: agent/pre-step - the per-turn reset (pure observer).
	Context.on("agent/pre-step", async (Payload, Next) => {
		const Decision = await Next();
		try {
			const Messages = (Payload as { messages?: { role?: string }[] } | undefined)?.messages;
			const Last = Array.isArray(Messages) ? Messages[Messages.length - 1] : undefined;
			if (Last?.role === "user") {
				Agent((Payload as { agent?: object } | undefined)?.agent).TurnNotes = 0;
			}
		} catch {
			/* the reset never breaks a step */
		}
		return Decision;
	});

	// The loader ignores any return value; test probes read the built State
	// through this debug attachment instead (never a return from apply).
	(Context as { __replaySuggesterState?: State }).__replaySuggesterState = State;
};
