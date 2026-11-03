// Apply - the plugin entry function, a THIN MODULE WIRE-UP in the factory
// family's shape: build the State through `Factory.State`, emit the durable
// activation proof, and register the hook's OWN listeners. The
// graph-suggester's special step: the candidate list comes from the WORKSPACE
// GRAPH SERVICE (`ctx.workspaceGraph.neighborhood(anchor, limit)`) - the
// instantiated connected component with the ANCHOR EXCLUDED (the importers,
// the dependencies, the tests, the doc block) - and from NOWHERE else. The
// file the agent just touched is never a target, so the note names the files
// around it, never the one it already read. The private literal pack and its
// static fallback targets are RETIRED (`Variable/Defaults.ts` is unimported):
// when the graph answers with an empty component the hook abstains
// `abstained no-companions <id> <k>` instead of naming a literal path, and
// when the service is absent or throws it abstains
// `abstained graph-unavailable <id> <k>` after ONE `graph unavailable` line
// per apply. The graph intent never guesses.
//
//   1. tools/post-execute (waterfall, plain ctx.on): next() first, the anchor
//      probe, the graph query, the synthetic intents of this call, detect,
//      gate, resolve, and ONE additionalContexts notice. Never replaces
//      content.
//   2. agent/pre-step (waterfall, plain): the per-turn reset of the
//      per-turn note counter when a user message enters.
//
// THE INTENTS ARE SYNTHESIZED FROM THE QUERY, NOT FROM A TABLE: one graph
// answer yields at most two intents, prepended as data so the existing
// Detect/gate/note pipeline judges them exactly like a compiled pack:
//
//   Neighborhood - priority 1: the whole connected component, the anchor
//                  excluded;
//   Sibling      - priority 2: its same-directory projection (the anchor
//                  excluded), the directory peers the same component names.
//
// Both carry ONE signal (`rule: "graph"`, the literal `.` pattern, weight
// 2.5) and the 0.75 floor, so `k = sigmoid(2.5 - 0.6) = 0.87` for either.
// The Neighborhood intent outranks Sibling on the tie, so Sibling speaks when
// the config's `intents` list selects it alone.
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
import type { GraphEntry } from "@Interface/Graph.js";
import type WorkspaceGraph from "@Interface/Graph.js";
import type { Candidate, Intent } from "@Interface/Pack.js";
import type { AgentMemory } from "@Interface/State.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/ets-base-dsh";
import Version from "@Variable/Version.js";

import Detect, { Compile } from "./Detect.js";
import BuildNote, { Prepend } from "./Note.js";

/** The graph intents' confidence floor (the retired pack's floor, kept as the gate). */
const GraphThreshold = 0.75;

/** The Neighborhood intent's caveat line (byte-exact; carried into the per-call intent). */
const NeighborhoodNote = "the files around this one: importers, dependencies, tests, doc block.";

/** The Sibling intent's caveat line (byte-exact; carried into the per-call intent). */
const SiblingNote = "check the family roster before assuming a package exists or is wired.";

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
	// NO BOOT PACK: the intents are synthesized per call from the graph query,
	// so the compiled rule set starts empty and the retired literal pack
	// (Variable/Defaults) is never imported.
	State.Rules = [];

	// The graph service: read through the injector at USE time (the
	// tool-jobs precedent for registries read late) - the inject declaration
	// orders it, and the runtime absence is handled by the abstention path.
	const Graph = (): WorkspaceGraph | undefined =>
		(Context as { workspaceGraph?: WorkspaceGraph }).workspaceGraph;

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
	// ledger alone. The second segment is `graph` (not an intent count):
	// there is no boot pack, because every candidate comes from the graph
	// query and the retired literal pack is never a source.
	if (!State.On) {
		Factory.Append(State, "disabled (enabled=false)");
	} else {
		Factory.Append(
			State,
			Activate([
				["", `bundle ${Version}`],
				["", "graph"],
				["", `threshold ${State.Threshold}`],
			]),
		);
	}

	// Whether a call is judged: only the configured tool names.
	const Judged = (Name: string): boolean =>
		Array.isArray(State.EmitOn) && State.EmitOn.includes(Name);

	// Whether an intent is enabled: an empty `intents` list enables every
	// graph intent; a non-empty list enables exactly the ids it names.
	const Enabled = (Id: string): boolean =>
		State.Intents.length === 0 || State.Intents.includes(Id);

	// A candidate is dropped when its path sits under one of the exclude
	// prefixes (Target/, node_modules, ...).
	const Excluded = (Path: string): boolean =>
		(State.Exclude ?? []).some((Prefix) => Prefix.length > 0 && Path.includes(Prefix));

	// The note text: the intent header, the capped candidate list with one
	// reason per candidate, and the intent's caveat line - bound to
	// maxNoteChars.
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

	// THE GRAPH QUERY: the connected component around the anchor, or
	// undefined when no answer exists - the config switch is off, the service
	// is absent, or it throws. `graph unavailable` is logged ONCE per apply
	// (never once per call); a throw carries its reason, bounded to 80 chars.
	const Component = (Path: string): GraphEntry[] | undefined => {
		if (!State.Graph) {
			return undefined;
		}
		const Service = Graph();
		if (!Service) {
			if (!State.Unavailable) {
				State.Unavailable = true;
				Factory.Append(State, "graph unavailable");
			}
			return undefined;
		}
		try {
			return Service.neighborhood(Path, State.MaxCandidates) ?? [];
		} catch (Error) {
			if (!State.Unavailable) {
				State.Unavailable = true;
				Factory.Append(State, `graph unavailable ${String(Error).slice(0, 80)}`);
			}
			return undefined;
		}
	};

	// The comparison form of a path: backslashes become slashes and a leading
	// `./` is stripped, so a repo-relative probe and a resolved display path
	// agree on the same file. The note still names the entry's own path.
	const Normalize = (Value: string): string => Value.replace(/\\/g, "/").replace(/^\.\//, "");

	// Whether a component entry IS the anchor: an exact match after
	// normalization, or - when the anchor is repo-relative - a path that ends
	// with `/<anchor>`, so an absolute display path still matches. The anchor
	// is the file the agent just touched, so it is never a target.
	const IsAnchor = (Entry: string, Anchor: string): boolean =>
		Entry === Anchor || (!Anchor.startsWith("/") && Entry.endsWith(`/${Anchor}`));

	// The graph entries as candidates: prior 1.0 (the graph answered), the
	// entry's own reason, its role when the reason is empty, and no path-less
	// entry. THE ANCHOR IS DROPPED HERE: naming the file the agent just read
	// back to it is noise, so the component is reduced to its companions.
	const Targets = (Entries: readonly GraphEntry[], AnchorPath: string): Candidate[] => {
		const Companions = Entries.filter(
			(Entry) => Entry.path.length > 0 && !IsAnchor(Normalize(Entry.path), AnchorPath),
		);
		return Companions.map((Entry) => ({
			path: Entry.path,
			reason: Entry.reason.length > 0 ? Entry.reason : Entry.role,
			prior: 1.0,
		}));
	};

	// THE SYNTHETIC INTENTS OF ONE CALL, prepended as data. Neighborhood is
	// the whole component minus the anchor; Sibling is its SAME-DIRECTORY
	// projection (the anchor excluded) and is synthesized only when that
	// projection is non-empty. An intent the config does not enable is not
	// synthesized.
	// The config `threshold` is a FLOOR: it may raise the 0.75 gate, never
	// lower it.
	const Rows = (Path: string, Entries: GraphEntry[] | undefined): Intent[] => {
		const Raw = Entries ?? [];
		const AnchorPath = Normalize(Path);
		const All = Targets(Raw, AnchorPath);
		// The entry that IS the anchor (exact path, else path suffix - the
		// graph's own anchor match). It is no longer a target, but it still
		// names the directory of the Sibling projection, so a repo-relative
		// probe and an absolute display path agree on the folder.
		const Folder = (Value: string): string => {
			const Cut = Value.lastIndexOf("/");
			return Cut < 0 ? "" : Value.slice(0, Cut + 1);
		};
		const AnchorEntry = Raw.find((Entry) => IsAnchor(Normalize(Entry.path), AnchorPath));
		const Directory = Folder(Normalize(AnchorEntry?.path ?? AnchorPath));
		const Same = All.filter((Target) => Folder(Normalize(Target.path)) === Directory);
		const Build = (
			Id: string,
			Priority: number,
			Candidates: Candidate[],
			Note: string,
		): Intent => ({
			id: Id,
			priority: Priority,
			threshold: Math.max(GraphThreshold, State.Threshold),
			signals: [{ rule: "graph", pattern: ".", weight: 2.5 }],
			targets: Candidates,
			note: Note,
		});
		const Built: Intent[] = [];
		if (Enabled("Neighborhood")) {
			Built.push(Build("Neighborhood", 1, All, NeighborhoodNote));
		}
		if (Enabled("Sibling") && Same.length > 0) {
			Built.push(Build("Sibling", 2, Same, SiblingNote));
		}
		return Built;
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
				// THE ANCHOR: without one there is nothing to ask the graph, so
				// the graph intent stays silent (silence is the honest answer -
				// no line, because no intent applies).
				const Path = Anchor(Probe);
				if (Path === undefined) {
					return Decision;
				}
				// THE GRAPH ANSWER (the only candidate source): the connected
				// component around the anchor. Undefined = no answer.
				const Entries = Component(Path);
				// The synthetic intents of this call, prepended as data, so the
				// classifier, the gate and the note judge them like a pack.
				const Match = Detect(Compile(Rows(Path, Entries)), Exec.name, Probe);
				if (Match === null) {
					return Decision;
				}
				const Verdict = Gate(Memory, Match.intent.id);
				if (Verdict !== "emit") {
					Factory.Append(State, `suppressed ${Verdict} ${Match.intent.id}`);
					return Decision;
				}
				// No answer at all (switch off, service absent, or a throw): the
				// graph intent ABSTAINS and names the intent and its k.
				if (Entries === undefined) {
					Factory.Append(
						State,
						`abstained graph-unavailable ${Match.intent.id} ${Match.k.toFixed(2)}`,
					);
					return Decision;
				}
				// The component is EMPTY, or it holds nothing but the anchor
				// itself: the file the agent just touched is not a companion, so
				// there is no path to name. The literal fallback is gone, and the
				// honest answer is silence.
				if (Entries.length === 0 || Match.intent.targets.length === 0) {
					Factory.Append(
						State,
						`abstained no-companions ${Match.intent.id} ${Match.k.toFixed(2)}`,
					);
					return Decision;
				}
				const Candidates = Match.intent.targets
					.filter((Target) => !Excluded(Target.path))
					.slice(0, State.MaxCandidates);
				if (Candidates.length === 0) {
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
					`suggest ${Match.intent.id} ${Match.k.toFixed(2)} ${Candidates.length} candidates call ${Exec.name}`,
				);
				const Note = BuildNote(
					Text(Match.intent, Candidates, Match.k),
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
