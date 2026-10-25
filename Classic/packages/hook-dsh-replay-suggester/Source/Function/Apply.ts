// Apply - the plugin entry function, a THIN MODULE WIRE-UP in the factory
// family's shape: build the State through `Factory.State`, emit the durable
// activation proof, load the SEEDED history store ONCE (boot path), probe the
// storage facility for the PRODUCER's durable tier, compile the pack ONCE, and
// register the hook's OWN listeners. The replay-suggester's special steps:
//
//   * THE PRODUCER (the wave 2c re-spec): every judged call that names a path
//     is appended to the recall history (Function/Record) - the per-agent
//     ring, the durable mirror, and the durable tier (the `replay_history`
//     domain or the JSON fallback, Function/Storage/Recover/Persist). The
//     append happens BEFORE the recall, and the sequence fence keeps the call
//     out of its own recall.
//   * THE RECALL: the seeded store first (the fixtures' contract), then the
//     live history (the agent ring, then the durable mirror). The Repeat
//     intent RESOLVES through the recalled record - the candidates are the
//     files touched last time, and the note's caveat line names the command
//     that verified. Without a record the hook ABSTAINS (`replay no-memory`):
//     a replay answer without a record is a guess, and the plan forbids the
//     guess (§2.4).
//
//   1. tools/post-execute (waterfall, plain ctx.on): next() first, record,
//      detect, gate, recall, and prepend ONE additionalContexts notice. Never
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
// THE WORKSPACE GATE + THE EXISTENCE FILTER: the history store and the pack
// belong to the repo's graph (the built-in pack when the repo has no pack
// file), so the listener resolves the workspace root first (the nearest
// ancestor whose pack signature matches; the built-in default is
// Documentation/ARCHIVE-STYLE.md, from the call path plus the session cwd).
// A foreign workspace has no pack and abstains (`abstained foreign-workspace`).
// The recalled files are HISTORY RECORDS, not workspace paths: they are
// EXEMPT from the existence filter, while a record with an empty file set
// still logs `abstained no-companions`. The intents and the caveat come from
// the RESOLVED pack per call (Families(pack, "replay")), compiled once per
// root, so a repo pack overrides the built-in intent without a restart.
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
import { Families, Locate } from "@playform/lib-dsh-pack";
import Defaults from "@Variable/Defaults.js";

import Detect, { Compile } from "./Detect.js";
import History, { LIFT, Recall } from "./History.js";
import BuildNote, { Prepend } from "./Note.js";
import RecallHistory from "./RecallHistory.js";
import Record from "./Record.js";
import Recover from "./Recover.js";
import Storage from "./Storage.js";

// The bundle version, mirrored from package.json (the activation proof's
// first field; a release bumps both together).
const Version = "0.2.0";

/** Fresh per-agent memory. */
const FreshMemory = (): AgentMemory => ({
	Calls: 0,
	Noted: new Map(),
	TurnNotes: 0,
	Ring: [],
	History: [],
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
			RecordPath: "recordPath",
			Depth: "historyDepth",
		},
	});
	State.Factory = Factory;
	State.Agents = new WeakMap();
	// THE STORE'S OWN STATE (the producer's tiers): the durable mirror starts
	// empty, the sequence at zero, no domain open yet, and the JSON fallback
	// as the default until a facility is probed.
	State.History = [];
	State.Seq = 0;
	State.Handle = undefined;
	State.Pending = Promise.resolve();
	State.Flush = async (): Promise<void> => {
		await State.Pending;
	};

	// The history store, read ONCE at apply (boot path, not hot path). The
	// load outcome lands in the ledger; a missing or corrupt store degrades
	// to silence, never a throw.
	State.Records = History(State.HistoryPath, (Line: string) => Factory.Append(State, Line));

	// THE STORE PROBE (the completion spec's wave 2c re-spec: the hook is the
	// recall store's PRODUCER). The storage hub's domain form first, then the
	// provided storageDomain service - `ctx.get` never throws on a missing
	// service, and this hook must work without one (the JSON fallback is the
	// documented degraded tier). The domain's open and recovery run on the
	// store chain, so the first write can never overtake them.
	const Facility =
		(Context.get?.("storage") as { domain?: unknown } | undefined)?.domain ??
		Context.get?.("storageDomain");
	switch (true) {
		case !!Facility:
			Context.effect?.(() => {
				State.Pending = State.Pending.then(() => Storage(State, Facility));
				return () => {
					const Handle = State.Handle;
					State.Handle = undefined;
					switch (true) {
						case !!Handle:
							void Handle.close().catch(() => {
								/* close best-effort */
							});
							break;
						default:
					}
				};
			}, "replay-history-storage");
			break;
		default:
			// The FALLBACK: no facility - the JSON snapshot is the store, read
			// synchronously on mount (the PoC's ordering, unchanged).
			Recover(State);
	}

	// The compile rule, shared by the built-in boot compile and the per-root
	// workspace compile: the configured intent list filters the pack (empty =
	// all), and the config threshold is a FLOOR (the pack may raise it).
	const Build = (Rows: typeof Defaults) => {
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
	// The built-in compile: the activation proof's count and the no-pack path.
	State.Rules = Build(Defaults);
	// The per-root compile memo: a resolved workspace pack's intents are
	// compiled once per (root, threshold, intents) tuple, never on every call.
	const Compiled = new Map<string, typeof State.Rules>();
	const Rules = (Root: string, Rows: typeof Defaults): typeof State.Rules => {
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
		Caveat: string,
	): string => {
		const Header = `[replay-suggester] intent=${IntentId} confidence=${K.toFixed(2)}`;
		const Lines = Targets.map((Target) => `- ${Target.path} - ${Target.reason}`);
		const Note =
			Record.verify.length > 0
				? `note: last time verified with ${Record.verify}`
				: `note: ${Caveat.length > 0 ? Caveat : "the recall is the answer"}`;
		const Full = `${Header}\ntargets (${Targets.length}):\n${[...Lines, Note].join("\n")}`;
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
				// The workspace gate, BEFORE detect/score: the history store
				// and the pack belong to the repo's graph (the built-in pack
				// when the repo has no pack file), so a call that belongs to
				// another workspace has nothing to name here. The signature
				// comes from the pack (default: Documentation/ARCHIVE-STYLE.md).
				const Cwd = Session(Context, Exec);
				const CallPath = Path(Exec);
				const Located = Locate(CallPath, Cwd);
				if (Located === undefined) {
					Factory.Append(State, "abstained foreign-workspace  0.00");
					return Decision;
				}
				// The resolved pack's intents, compiled once per root (the
				// built-in compile covers the no-pack path).
				const Intents = Rules(Located.root, Families(Located.pack, "replay"));
				const Memory = Agent(Exec.agent);
				Memory.Calls += 1;
				// The probe: the tool name plus the arguments JSON.
				const Probe = `${Exec.name} ${JSON.stringify(Exec.arguments ?? {})}`;
				Memory.Ring.unshift(Probe);
				Memory.Ring.length = Math.min(Memory.Ring.length, 8);
				// THE PRODUCER (the wave 2c re-spec): the judged call enters the
				// recall history BEFORE the recall runs, so the entry exists on
				// every return path below; the sequence fence keeps the call out
				// of its own recall. A call that names no path touched nothing
				// to recall and is not recorded.
				const Recorded =
					CallPath.length === 0
						? undefined
						: Record(State, Memory, {
								path: CallPath,
								intent: "replay",
								outcome: String(Decision.kind),
								at: Date.now(),
								probe: Probe,
							});
				// The recall: the SEEDED store first (the fixtures' contract),
				// then the LIVE history - the agent's own ring, then the durable
				// mirror (a reopened store's entries). The recalled files are
				// HISTORY RECORDS, exempt from the existence filter.
				const Fence = Recorded === undefined ? Number.POSITIVE_INFINITY : Recorded.seq;
				const Recalled =
					Recall(State.Records, Probe) ??
					RecallHistory(Memory.History, Probe, CallPath, State.LearnWindow, Fence) ??
					RecallHistory(State.History, Probe, CallPath, State.LearnWindow, Fence);
				const Match = Detect(Intents, Exec.name, Probe, Recalled === undefined ? 0 : LIFT);
				if (Match === null) {
					return Decision;
				}
				// The call was judged under this intent: the recorded entry
				// carries the final label (the persist reads it after the
				// listener returns, so the label is already final).
				if (Recorded !== undefined) {
					Recorded.intent = Match.intent.id;
				}
				// A record with an empty file set still abstains `no-companions`.
				const Existing = Recalled === undefined ? [] : Recalled.files;
				if (Recalled !== undefined && Existing.length === 0) {
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
				// Resolve: the Repeat intent resolves ONLY through the record.
				if (Recalled === undefined) {
					Factory.Append(
						State,
						`abstained no-memory ${Match.intent.id} ${Match.k.toFixed(2)}`,
					);
					return Decision;
				}
				const Targets: Candidate[] = Existing.filter((File) => !Excluded(File))
					.slice(0, State.MaxCandidates)
					.map((File) => ({
						path: File,
						reason: `touched last time (${Recalled.intent})`,
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
					Text(Match.intent.id, Recalled, Targets, Match.k, Match.intent.note),
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
