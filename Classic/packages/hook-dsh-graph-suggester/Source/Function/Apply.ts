// Apply - the plugin entry function, a THIN MODULE WIRE-UP in the factory
// family's shape: build the State through `Factory.State`, emit the durable
// activation proof, compile the pack ONCE, and register the hook's OWN
// listeners. The graph-suggester's special step: for the Neighborhood
// intent, the candidate list comes from the WORKSPACE GRAPH SERVICE
// (ctx.workspaceGraph.neighborhood(anchor)) - the instantiated connected
// component (definition, callers, tests, doc block), with the pack's static
// fallback set appended only when the graph answers with an empty
// component. When the service is absent or throws, the Neighborhood intent
// ABSTAINS and one `graph unavailable` ledger line is logged per apply
// (never once per call): the graph intent never guesses.
//
//   1. tools/post-execute (waterfall, plain ctx.on): next() first, detect,
//      gate, resolve (graph query for Neighborhood), and prepend ONE
//      additionalContexts notice. Never replaces content.
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
// `inject: ["pluginFactory", "workspaceGraph"]` (Library.ts) - the loader's
// PENDING state orders the graph service first; a runtime absence still
// routes through the abstention path, never through a throw into the
// waterfall. The function returns NOTHING.
import type { Context } from "@deepseek-ai/cordis";
import type { PostToolDecision, ToolExecution } from "@deepseek-ai/dsh-tools";
import type Config from "@Interface/Config.js";
import type WorkspaceGraph from "@Interface/Graph.js";
import type { Candidate } from "@Interface/Pack.js";
import type { AgentMemory } from "@Interface/State.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/lib-dsh-core";
import Defaults from "@Variable/Defaults.js";

import Detect, { Compile } from "./Detect.js";
import BuildNote, { Prepend } from "./Note.js";

// The bundle version, mirrored from package.json (the activation proof's
// first field; a release bumps both together).
const Version = "0.2.0";

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
		module: "graph-suggester",
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
			Graph: "graph",
		},
	});
	State.Factory = Factory;
	State.Agents = new WeakMap();
	State.Unavailable = false;

	// The graph service: read through the injector at USE time (the
	// tool-jobs precedent for registries read late) - the inject declaration
	// orders it, and the runtime absence is handled by the abstention path.
	const Graph = (): WorkspaceGraph | undefined =>
		(Context as { workspaceGraph?: WorkspaceGraph }).workspaceGraph;

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

	// The note text: the intent header, the capped candidate list with one
	// reason per candidate, and the pack's caveat line - bound to maxNoteChars.
	const Text = (
		Intent: { id: string; note: string },
		Targets: Candidate[],
		K: number,
	): string => {
		const Header = `[graph-suggester] intent=${Intent.id} confidence=${K.toFixed(2)}`;
		const Lines = Targets.map((Target) => `- ${Target.path} - ${Target.reason}`);
		const Body = [...Lines, `note: ${Intent.note}`].join("\n");
		const Full = `${Header}\ntargets (${Targets.length}):\n${Body}`;
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

	// The anchor path for the graph query: the first quoted path-looking
	// value in the probe's arguments JSON (file_path, path, pattern, ...).
	const Anchor = (Probe: string): string | undefined => {
		const Found = /"([^"]+\.(?:ts|tsx|js|mjs|md))"/.exec(Probe);
		return Found?.[1];
	};

	// The Neighborhood candidate set: the graph's connected component first,
	// then the pack's static fallback set only when the component is EMPTY.
	// A missing/failing service abstains (returns undefined) and logs the
	// `graph unavailable` line once per apply.
	const Neighborhood = (Probe: string): Candidate[] | undefined => {
		if (!State.Graph) {
			return undefined;
		}
		const Service = Graph();
		const Path = Anchor(Probe);
		if (!Service || Path === undefined) {
			if (!State.Unavailable) {
				State.Unavailable = true;
				Factory.Append(State, "graph unavailable");
			}
			return undefined;
		}
		let Entries;
		try {
			Entries = Service.neighborhood(Path, State.MaxCandidates);
		} catch (Error) {
			if (!State.Unavailable) {
				State.Unavailable = true;
				Factory.Append(State, `graph unavailable ${String(Error).slice(0, 80)}`);
			}
			return undefined;
		}
		const FromGraph: Candidate[] = (Entries ?? [])
			.filter((Entry) => Entry.path.length > 0)
			.map((Entry) => ({
				path: Entry.path,
				reason: Entry.reason.length > 0 ? Entry.reason : Entry.role,
				prior: 1.0,
			}));
		if (FromGraph.length > 0) {
			return FromGraph;
		}
		// Empty component: the static fallback set, marked as fallback prior.
		const Fallback = Defaults.intents.find((Intent) => Intent.id === "Neighborhood");
		return Fallback === undefined ? undefined : Fallback.targets;
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
				const Match = Detect(State.Rules, Exec.name, Probe);
				if (Match === null) {
					return Decision;
				}
				const Verdict = Gate(Memory, Match.intent.id);
				if (Verdict !== "emit") {
					Factory.Append(State, `suppressed ${Verdict} ${Match.intent.id}`);
					return Decision;
				}
				// Resolve: the Neighborhood intent resolves through the graph;
				// every other intent resolves statically from the pack.
				const Resolved =
					Match.intent.id === "Neighborhood" ? Neighborhood(Probe) : Match.intent.targets;
				if (Resolved === undefined) {
					Factory.Append(
						State,
						`abstained graph-unavailable ${Match.intent.id} ${Match.k.toFixed(2)}`,
					);
					return Decision;
				}
				const Targets = Resolved.filter((Target) => !Excluded(Target.path)).slice(
					0,
					State.MaxCandidates,
				);
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
				// the waterfall.
				try {
					Context.logger?.warn(`graph-suggester: ${String(Error)}; the note is skipped`);
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
	(Context as { __graphSuggesterState?: State }).__graphSuggesterState = State;
};
