// Apply - the plugin entry function, a THIN MODULE WIRE-UP in the factory
// family's shape: build the State through `Factory.State` (the cell unwrap,
// the shared mappings Ledger←logFile / Enabled←log and the module's own
// fields via the setup `fields` map), emit the durable activation proof (the
// module's own string, via Factory.Append - the factory never owns ledger
// strings), and register the hook's OWN listeners:
//
//   1. session/event (plain): the HISTORY FOLD. Every `tool/call` event
//      becomes one Touch in the session's history (the pack library's fold
//      unit, capped at 512 touches). This is the candidate source.
//   2. tools/post-execute (waterfall, plain ctx.on - AFTER the CCR
//      {prepend:true} listener and normalize's post-execute): next() first,
//      then the co-touch candidates of the session history, or - only when
//      that history is empty - the EXPLICIT repo/user pack. It never
//      replaces content, only adds contexts.
//   3. agent/pre-step (waterfall, plain): the per-turn reset - the
//      per-turn note counter when a user message enters (the tool-coach
//      precedent).
//
// THE CANDIDATES COME FROM THE AGENT'S OWN PREVIOUS TOOL CALLS: the listener
// folds the session history through `Adjacent(touches, callPath)` and names
// the files that were touched right after this one in this workspace. The
// literal built-in pack is NOT consulted; the pack survives only as an
// EXPLICIT override (`<repo>/.dsh/pack.yml` or the user layer), resolved with
// `builtin: false`. A packless workspace with no history abstains
// (`abstained no-history`).
//
// THE LEARNING BOOTSTRAP IS RETIRED: the literal learner is no longer called
// (the learner and its source files were removed) and the config's
// `learning` field is kept only for compatibility.
//
// THE WATERFALL DISCIPLINE (the ccr/tool-coach precedent, live-verified):
//   * `next()` is ALWAYS awaited FIRST, before any decision;
//   * pass-through is `return decision` unchanged;
//   * FAIL-OPEN: every listener body is one try/catch - on any error a
//     logger.warn records it and the downstream decision is returned
//     UNCHANGED. A note never fails a tool call.
//
// THE WORKSPACE GATE + THE EXISTENCE FILTER: the root is the PACK-INDEPENDENT
// repo root (the nearest ancestor carrying `.git` or `package.json`, from the
// call path plus the session cwd). A call outside any workspace abstains
// (`abstained foreign-workspace`); a target absent from all three bases is
// dropped BEFORE the gate (`abstained no-companions` when the intent's whole
// target set is gone). The pack's intents come from the RESOLVED pack per
// call (Families(pack, "convention")), compiled once per root, so an explicit
// repo pack overrides the pack intents without a restart.
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
import type { UserMessage } from "@deepseek-ai/dsh-llm";
import type { PostToolDecision, ToolExecution } from "@deepseek-ai/dsh-tools";
import { Activate } from "@playform/lib-dsh-core";
import {
	Adjacent,
	Families,
	Fold,
	Home,
	Locate,
	Resolve,
	Root as RootOf,
} from "@playform/lib-dsh-pack";

import type Config from "../Interface/Config.js";
import type { Candidate } from "../Interface/Pack.js";
import type { AgentMemory } from "../Interface/State.js";
import type State from "../Interface/State.js";
import Version from "../Variable/Version.js";
import Detect, { Compile } from "./Detect.js";
import Exists from "./Exists.js";
import BuildNote, { Prepend } from "./Note.js";

/** Fresh per-agent memory. */
const FreshMemory = (): AgentMemory => ({
	Calls: 0,
	Noted: new Map(),
	TurnNotes: 0,
	Ring: [],
});

/** The path the call names (the file_path argument, then path, then ""). */
const Path = (Exec: ToolExecution): string => {
	const Args = (Exec.arguments ?? {}) as Record<string, unknown>;
	switch (true) {
		case typeof Args["file_path"] === "string":
			return String(Args["file_path"]);
		case typeof Args["path"] === "string":
			return String(Args["path"]);
		default:
			return "";
	}
};

/**
 * The session cwd, probed from the OPTIONAL harness service - never a hard
 * inject, never an unguarded accessor: the service may be absent (a bare
 * mount) and its getter may throw. The probe must never throw; a missing cwd
 * simply falls back to process.cwd() inside the resolver.
 */
const Session = (Context: Context, Exec: ToolExecution): string | undefined => {
	try {
		const Service = Context.get?.("workingDirectory") as
			{ get?: (Session: unknown) => unknown } | undefined;
		const Cwd = Service && Exec.agent ? Service.get?.(Exec.agent.session) : undefined;
		return typeof Cwd === "string" && Cwd.length > 0 ? Cwd : undefined;
	} catch {
		return undefined;
	}
};

/**
 * Prepend ONE note to the downstream decision's additionalContexts, preserving
 * the decision's kind (a block keeps its feedback) and every downstream
 * context's identity. Every emit path shares it.
 */
const Attach = (Downstream: PostToolDecision, Note: UserMessage): PostToolDecision => {
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
};

export default (Context: Context, Options: Config): void => {
	// The injected factory service (typed via Interface/Factory's Context
	// augmentation; guaranteed present by the inject declaration).
	const Factory = Context.pluginFactory;
	// The State: the factory's shared shape plus the hook's own fields,
	// copied from the (cell-unwrapped) validated config by the setup map.
	const State: State = Factory.State<State>(Context, Options, {
		module: "convention-suggester",
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
			Learning: "learning",
		},
	});
	State.Factory = Factory;
	State.Agents = new WeakMap();
	State.History = new WeakMap();

	// The compile rule, shared by every explicit-pack compile: the configured
	// intent list filters the pack (empty = all), and the config threshold is
	// a FLOOR (the pack may raise it).
	const Build = (Rows: ReturnType<typeof Families>) => {
		const Enabled = State.Intents.length > 0 ? new Set(State.Intents) : undefined;
		return Compile(
			Rows.filter((Intent) => Enabled === undefined || Enabled.has(Intent.id)).map(
				(Intent) => ({
					...Intent,
					threshold: Math.max(Intent.threshold, State.Threshold),
				}),
			),
		);
	};
	// No boot compile: the candidates come from the session history, and only
	// an explicit pack compiles (per root, below).
	State.Rules = [];
	// The per-root compile memo: a resolved workspace pack's intents are
	// compiled once per (root, threshold, intents) tuple, never on every call.
	const Compiled = new Map<string, typeof State.Rules>();
	const Rules = (Root: string, Rows: ReturnType<typeof Families>): typeof State.Rules => {
		const Key = `${Root}\u0000${State.Threshold}\u0000${State.Intents.join(",")}`;
		const Hit = Compiled.get(Key);
		if (Hit !== undefined) {
			return Hit;
		}
		const Built = Build(Rows);
		Compiled.set(Key, Built);
		return Built;
	};

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
				["", "history"],
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
	// reason per candidate, and the intent's caveat line - bound to
	// maxNoteChars.
	const Text = (
		Intent: { id: string; note: string },
		Targets: Candidate[],
		K: number,
	): string => {
		const Header = `[convention-suggester] intent=${Intent.id} confidence=${K.toFixed(2)}`;
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

	// Listener 1: session/event - the history fold. Every `tool/call` event
	// becomes one Touch (the pack library's fold unit) in the SESSION's
	// history, so the candidates come from the agent's OWN previous calls in
	// this workspace. One entry per session object, created lazily; the array
	// is capped at 512 (the oldest touch is shifted out). Fail-open: a
	// malformed event is skipped, never thrown.
	Context.on("session/event", (Session_: unknown, Event: unknown): void => {
		try {
			const Key = (Session_ as object | undefined) ?? DefaultKey;
			let History = State.History.get(Key);
			if (History === undefined) {
				History = { Seq: 0, Touches: [] };
				State.History.set(Key, History);
			}
			const Touch = Fold(
				Event as { type?: string; name?: string; arguments?: unknown },
				History.Seq,
			);
			if (Touch === undefined) {
				return;
			}
			History.Seq += 1;
			History.Touches.push(Touch);
			if (History.Touches.length > 512) {
				History.Touches.shift();
			}
		} catch {
			/* the fold never breaks the event bus */
		}
	});

	// Listener 2: tools/post-execute - the note. Plain registration: runs
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
				// The workspace root, BEFORE any candidate work: the
				// pack-independent repo root (the nearest ancestor carrying
				// `.git` or `package.json`) from the call path plus the
				// session cwd. A call outside any workspace has no history to
				// mine here and abstains.
				const CallPath = Path(Exec);
				const Cwd = Session(Context, Exec);
				const Root = RootOf(CallPath, Cwd);
				if (Root === undefined) {
					Factory.Append(State, "abstained foreign-workspace  0.00");
					return Decision;
				}
				const Memory = Agent(Exec.agent);
				Memory.Calls += 1;
				// The probe: the tool name plus the arguments JSON - kept for
				// parity with the plan's ring buffer.
				const Probe = `${Exec.name} ${JSON.stringify(Exec.arguments ?? {})}`;
				Memory.Ring.unshift(Probe);
				Memory.Ring.length = Math.min(Memory.Ring.length, 8);
				// The session history: the agent's OWN previous tool calls,
				// folded per session, never the literal built-in pack.
				const Key =
					(Exec.agent as { session?: object } | undefined)?.session ??
					Exec.agent ??
					DefaultKey;
				const Touches = State.History.get(Key)?.Touches ?? [];
				const Nearby = Adjacent(Touches, CallPath, { limit: State.MaxCandidates });
				if (Nearby.length > 0) {
					// The co-touch candidates: a repeatedly co-touched path
					// outranks a single one, and a near neighbour outranks a
					// far one (the pack library's Adjacent). The confidence
					// rises with the total co-touch count, capped at 0.95.
					const TotalCount = Nearby.reduce((Sum, Entry) => Sum + Entry.count, 0);
					const K = Math.min(0.95, 0.6 + 0.05 * TotalCount);
					const Filtered = Nearby.map((Entry) => ({
						path: Entry.path,
						kind: "",
						prior: 0.6,
						reason: `touched ${Entry.count} time(s) after this file`,
					})).filter((Target) => Exists(Target.path, CallPath, Root, Cwd));
					const Targets = Filtered.filter((Target) => !Excluded(Target.path)).slice(
						0,
						State.MaxCandidates,
					);
					if (Targets.length === 0) {
						Factory.Append(State, `abstained ambiguous History ${K.toFixed(2)}`);
						return Decision;
					}
					const Verdict = Gate(Memory, "History");
					if (Verdict !== "emit") {
						Factory.Append(State, `suppressed ${Verdict} History`);
						return Decision;
					}
					Memory.Noted.set("History", Memory.Calls);
					Memory.TurnNotes += 1;
					Factory.Append(
						State,
						`suggest History ${K.toFixed(2)} ${Targets.length} candidates call ${Exec.name}`,
					);
					return Attach(
						Decision,
						BuildNote(
							Text(
								{
									id: "History",
									note: "these files were touched right after this one in this workspace",
								},
								Targets,
								K,
							),
							`History ${K.toFixed(2)}`,
						),
					);
				}
				// No history: only an EXPLICIT repo/user pack may still speak.
				// The built-in pack is never a candidate source, so a
				// layer-less workspace resolves to undefined (`builtin: false`).
				const Pack = Resolve(Root, { home: Home(), builtin: false });
				if (Pack === undefined) {
					Factory.Append(State, "abstained no-history  0.00");
					return Decision;
				}
				// The pack's own signature gates it: a pack that declares a
				// marker the workspace does not carry stays silent.
				const Located = Locate(CallPath, Cwd);
				if (Located === undefined) {
					Factory.Append(State, "abstained foreign-workspace  0.00");
					return Decision;
				}
				// The resolved pack's intents, compiled once per root.
				const Intents = Rules(Root, Families(Pack, "convention"));
				const Match = Detect(Intents, Exec.name, Probe);
				if (Match === null) {
					return Decision;
				}
				// The base-aware existence filter, BEFORE the gate: a target
				// absent from all three bases is dropped; a family with none
				// left abstains.
				const Existing = Match.intent.targets.filter((Target) =>
					Exists(Target.path, CallPath, Root, Cwd),
				);
				if (Existing.length === 0) {
					Factory.Append(
						State,
						`abstained no-companions ${Match.intent.id} ${Match.k.toFixed(2)}`,
					);
					return Decision;
				}
				const Verdict = Gate(Memory, Match.intent.id);
				if (Verdict !== "emit") {
					Factory.Append(State, `suppressed ${Verdict} ${Match.intent.id}`);
					return Decision;
				}
				// The candidate set: capped at maxCandidates, exclude-filtered,
				// in pack order. An empty surviving set abstains.
				const Targets = Existing.filter((Target) => !Excluded(Target.path)).slice(
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
				return Attach(Decision, Note);
			} catch (Error) {
				// Fail-open: keep the downstream decision, warn, never throw into
				// the waterfall (a thrown listener would fail the tool result).
				try {
					Context.logger?.warn(
						`convention-suggester: ${String(Error)}; the note is skipped`,
					);
				} catch {
					/* logger optional */
				}
				return Decision;
			}
		},
	);

	// Listener 3: agent/pre-step - the per-turn reset. When the step's
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
	(Context as { __conventionSuggesterState?: State }).__conventionSuggesterState = State;
};
