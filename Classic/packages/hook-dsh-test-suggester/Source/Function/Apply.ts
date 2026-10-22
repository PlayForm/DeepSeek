// Apply - the plugin entry function, a THIN MODULE WIRE-UP in the factory
// family's shape: build the State through `Factory.State` (the cell unwrap,
// the shared mappings Ledger←logFile / Enabled←log and the module's own
// fields via the setup `fields` map), emit the durable activation proof (the
// module's own string, via Factory.Append - the factory never owns ledger
// strings), compile the pack ONCE, and register the hook's OWN listeners:
//
//   1. tools/post-execute (waterfall, plain ctx.on - AFTER the CCR
//      {prepend:true} listener and normalize's post-execute): next() first,
//      detect, gate, and prepend ONE additionalContexts notice to the
//      downstream decision. It never replaces content, only adds contexts,
//      so a ccr-compressed result is unaffected.
//   2. agent/pre-step (waterfall, plain): the per-turn reset - the
//      per-turn note counter when a user message enters (the tool-coach
//      precedent).
//
// THE WATERFALL DISCIPLINE (the ccr/tool-coach precedent, live-verified):
//   * `next()` is ALWAYS awaited FIRST, before any decision;
//   * pass-through is `return decision` unchanged;
//   * FAIL-OPEN: every listener body is one try/catch - on any error a
//     logger.warn records it and the downstream decision is returned
//     UNCHANGED. A note never fails a tool call.
//
// NOT factory machinery, deliberately: no fs/observed Wire, no Attach, no
// factory Schema - the hook owns its schema (Variable/Config.ts) and its
// strings. The function returns NOTHING (a returned value silently kills
// event delivery, live-verified).
//
// `inject: ["pluginFactory"]` (Library.ts) - the factory is a REQUIRED
// service (the State builder + the ledger); the loader's PENDING state
// handles the ordering, so bundle-layer order never matters.
import type { Context } from "@deepseek-ai/cordis";
import type { PostToolDecision, ToolExecution } from "@deepseek-ai/dsh-tools";
import type Config from "@Interface/Config.js";
import type { Candidate } from "@Interface/Pack.js";
import type { AgentMemory } from "@Interface/State.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/lib-dsh-core";
import Defaults from "@Variable/Defaults.js";

import Detect, { Compile } from "./Detect.js";
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
		module: "test-suggester",
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
		},
	});
	State.Factory = Factory;
	State.Agents = new WeakMap();

	// The compiled pack, built ONCE at apply (boot path, not hot path) from
	// the module's own embedded pack. The configured intent list filters the
	// pack: an empty list enables all pack intents; a listed intent not in
	// the pack is ignored.
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
	// ledger alone. The FIELD LIST is the module's own; the `activated (`
	// mechanics live in the core's Activate composer.
	if (!State.On) {
		Factory.Append(State, "disabled (enabled=false)");
	} else {
		Factory.Append(
			State,
			Activate([
				// Bare segments (empty key): the plan's activation format (§4.9).
				["", `bundle ${Version}`],
				["", `intents ${State.Rules.length}`],
				["", `threshold ${State.Threshold}`],
			]),
		);
	}

	// Whether a call is judged: only the configured tool names.
	const Judged = (Name: string): boolean =>
		Array.isArray(State.EmitOn) && State.EmitOn.includes(Name);

	// A candidate is dropped when its path sits under one of the exclude
	// prefixes (Target/, node_modules, ...): Target/ is generated, never edit.
	const Excluded = (Path: string): boolean =>
		(State.Exclude ?? []).some((Prefix) => Prefix.length > 0 && Path.includes(Prefix));

	// The note text: the intent header, the capped candidate list with one
	// reason per candidate, and the pack's caveat line - bound to maxNoteChars.
	const Text = (
		Intent: { id: string; note: string },
		Targets: Candidate[],
		K: number,
	): string => {
		const Header = `[test-suggester] intent=${Intent.id} confidence=${K.toFixed(2)}`;
		const Lines = Targets.map((Target) => `- ${Target.path} - ${Target.reason}`);
		const Body = [...Lines, `note: ${Intent.note}`].join("\n");
		const Full = `${Header}\ntargets (${Targets.length}):\n${Body}`;
		if (Full.length <= State.MaxNoteChars) {
			return Full;
		}
		return `${Full.slice(0, State.MaxNoteChars - 1)}...`;
	};

	// The gate: cooldown, per-turn cap. Every refusal is a ledger line, so
	// the precision is measured, not assumed (the plan §2.4 posture).
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
				// The probe: the tool name plus the arguments JSON - the
				// classifier's single text basis (the plan's §3.3 rule shapes).
				const Probe = `${Exec.name} ${JSON.stringify(Exec.arguments ?? {})}`;
				Memory.Ring.unshift(Probe);
				Memory.Ring.length = Math.min(Memory.Ring.length, 8);
				const Match = Detect(State.Rules, Exec.name, Probe);
				if (Match === null) {
					return Decision;
				}
				const Verdict = Gate(Memory, Match.intent.id);
				if (Verdict !== "emit") {
					Factory.Append(State, `suppressed ${Verdict} ${Match.intent.id}`);
					return Decision;
				}
				// The candidate set: capped at maxCandidates, exclude-filtered,
				// in pack order. An empty surviving set abstains.
				const Targets = Match.intent.targets
					.filter((Target) => !Excluded(Target.path))
					.slice(0, State.MaxCandidates);
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
					Text(Match.intent, Targets, Match.k),
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
				// the waterfall (a thrown listener would fail the tool result).
				try {
					Context.logger?.warn(`test-suggester: ${String(Error)}; the note is skipped`);
				} catch {
					/* logger optional */
				}
				return Decision;
			}
		},
	);

	// Listener 2: agent/pre-step - the per-turn reset. When the step's
	// messages end with a user message (a new user turn), the per-turn note
	// counter resets. The listener is a PURE OBSERVER of the counter: next()
	// first, the downstream decision unchanged, fail-open.
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
	(Context as { __testSuggesterState?: State }).__testSuggesterState = State;
};
