// Apply - the plugin entry function, a THIN MODULE WIRE-UP in the factory
// family's shape: build the State through `Factory.State`, emit the durable
// activation proof, load the SEEDED history store ONCE (the optional boot
// seed), probe the storage facility for the PRODUCER's durable tier, and
// register the hook's OWN listeners. The replay-suggester's special steps:
//
//   * THE PRODUCER (the wave 2c re-spec): every judged call that names a path
//     is appended to the recall history (Function/Record) - the per-agent
//     ring, the durable mirror, and the durable tier (the `replay_history`
//     domain or the JSON fallback, Function/Storage/Recover/Persist). The
//     append happens BEFORE the recall, and the sequence fence keeps the call
//     out of its own recall.
//   * THE RECALL IS THE ONLY DEFAULT SOURCE: the seeded store first (the
//     optional user seed), then the live history (the agent ring, then the
//     durable mirror). When a recall exists it is SYNTHESIZED into ONE pack
//     family (`Repeat`) whose targets are the files touched last time, so the
//     note's candidates are the agent's OWN previous tool calls and never a
//     literal pack. The synthesized family's note keeps the caveat line, and
//     a record with no verification still falls back to it. Without a record
//     and without an explicit pack the hook ABSTAINS (`replay no-history`): a
//     replay answer without a record is a guess, and the plan forbids the
//     guess (§2.4).
//   * THE EXPLICIT PACK IS THE ONLY OVERRIDE: `Resolve(root, { builtin:
//     false })`, so a hand-written `replay/` family still speaks (it may
//     outrank the synthesized one) and the built-in pack is never consulted.
//
//   1. tools/post-execute (waterfall, plain ctx.on): next() first, record,
//      recall, the synthesized family, the explicit pack, detect, gate, and
//      prepend ONE additionalContexts notice. Never replaces content.
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
// THE WORKSPACE GATE: the root is PACK-INDEPENDENT (the nearest ancestor of
// the call path carrying `.git` or `package.json`, from the call path plus the
// session cwd). A call outside any workspace has no history to mine here and
// abstains (`abstained foreign-workspace`). THE RECALL IS VALIDATED AGAINST
// THE TREE: the store is cross-session by design, so a record may name a path
// that was deleted, a bare directory, or the call's own anchor - the anchor is
// excluded, only an existing regular file survives (Function/Exists's
// `IsFile`), a path in the anchor's OWN DIRECTORY wins outright (precision
// first), and without one the same release tree (Classic with Classic,
// EffectTS with EffectTS) ranks ahead of the other in a stable order. A
// record with no surviving path logs `abstained no-companions`.
// The explicit pack's families come from the RESOLVED pack per call
// (Families(pack, "replay")), compiled once per root, so a repo pack's own
// replay family joins the synthesized one without a restart.
//
// `inject: ["pluginFactory"]` (Library.ts) - the factory is a REQUIRED
// service (the State builder + the ledger); the loader's PENDING state
// handles the ordering. The function returns NOTHING.
import { dirname, isAbsolute, resolve, sep } from "node:path";

import type { Context } from "@deepseek-ai/cordis";
import type { PostToolDecision, ToolExecution } from "@deepseek-ai/dsh-tools";
import type Config from "@Interface/Config.js";
import type { ReplayRecord } from "@Interface/History.js";
import type { Candidate, Intent } from "@Interface/Pack.js";
import type { AgentMemory } from "@Interface/State.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/lib-dsh-core";
import { Families, Home, Resolve, Root as RootOf } from "@playform/lib-dsh-pack";
import Version from "@Variable/Version.js";

import Detect, { Compile } from "./Detect.js";
import { IsFile } from "./Exists.js";
import History, { Recall } from "./History.js";
import BuildNote, { Prepend } from "./Note.js";
import RecallHistory from "./RecallHistory.js";
import Record from "./Record.js";
import Recover from "./Recover.js";
import Storage from "./Storage.js";

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

/** The two release trees the workspace keeps side by side. */
const Trees = ["Classic", "EffectTS"] as const;

/** The release-tree prefix (`<...>/Classic` or `<...>/EffectTS`) of a path. */
const Tree = (Resolved: string): string | undefined => {
	for (const Name of Trees) {
		const Index = Resolved.indexOf(`${sep}${Name}${sep}`);
		if (Index >= 0) {
			return Resolved.slice(0, Index + Name.length + 1);
		}
	}
	return undefined;
};

/** The absolute form of a recorded path (the store may hold relative ones). */
const Absolute = (Value: string, Cwd: string | undefined): string =>
	isAbsolute(Value) ? Value : resolve(Cwd ?? process.cwd(), Value);

/**
 * The recalled record's files as candidate targets, VALIDATED against the
 * tree: the store is cross-session, so a record may name a path that was
 * deleted, a bare directory, or the call's own anchor. The anchor is
 * excluded, only an existing regular file survives (Exists's `IsFile`), and
 * the anchor's OWN DIRECTORY is the strong signal: when a surviving path sits
 * beside the anchor, only those paths are named (precision first). Without
 * such a neighbor the same release tree ranks ahead of the other in a STABLE
 * partition - a valid other-tree file is ranked after, never dropped.
 */
const Select = (Files: string[], Anchor: string, Cwd: string | undefined): string[] => {
	const AnchorFull = Absolute(Anchor, Cwd);
	const Directory = dirname(AnchorFull);
	const Own = Tree(AnchorFull);
	const Kept = Files.map((File) => ({ File, Full: Absolute(File, Cwd) })).filter(
		(Entry) => Entry.Full !== AnchorFull && IsFile(Entry.Full),
	);
	const Neighbors = Kept.filter((Entry) => dirname(Entry.Full) === Directory);
	switch (true) {
		// Precision first: a recall from the anchor's own directory is the
		// strong signal, so the neighbors ARE the answer.
		case Neighbors.length > 0:
			return Neighbors.map((Entry) => Entry.File);
		case Own === undefined:
			return Kept.map((Entry) => Entry.File);
		default: {
			const Same = Kept.filter((Entry) => Tree(Entry.Full) === Own);
			const Other = Kept.filter((Entry) => Tree(Entry.Full) !== Own);
			return [...Same, ...Other].map((Entry) => Entry.File);
		}
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

	// The compile rule for an EXPLICIT pack: the configured intent list
	// filters the families (empty = all), and the config threshold is a FLOOR
	// (the family may raise it, never lower it).
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
	// No boot projection: the candidates come from the recall, and only an
	// EXPLICIT repo/user pack compiles (per call, below). The retired
	// projection (Variable/Defaults) is no longer imported.
	State.Rules = [];
	// The per-root compile memo: an explicit pack's families are compiled once
	// per (root, threshold, intents) tuple, never on every call.
	const Compiled = new Map<string, ReturnType<typeof Build>>();
	const Rules = (Root: string, Rows: ReturnType<typeof Families>): ReturnType<typeof Build> => {
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
	// ledger alone. The second segment is `history` (not an intent count):
	// there is no boot pack, because the candidates come from the recall and
	// only an explicit pack may still speak. The fourth segment stays the
	// seeded store's record count.
	if (!State.On) {
		Factory.Append(State, "disabled (enabled=false)");
	} else {
		Factory.Append(
			State,
			Activate([
				["", `bundle ${Version}`],
				["", "history"],
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
				// The workspace gate, BEFORE the record/recall: the
				// PACK-INDEPENDENT repo root (the nearest ancestor carrying
				// `.git` or `package.json`) from the call path plus the session
				// cwd. A call outside any workspace has no history to mine
				// here and abstains.
				const Cwd = Session(Context, Exec);
				const CallPath = Path(Exec);
				const Root = RootOf(CallPath, Cwd);
				if (Root === undefined) {
					Factory.Append(State, "abstained foreign-workspace  0.00");
					return Decision;
				}
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
				// The recall: the SEEDED store first (the optional user seed),
				// then the LIVE history - the agent's own ring, then the durable
				// mirror (a reopened store's entries). The store is cross-session,
				// so the record is validated against THIS tree below.
				const Fence = Recorded === undefined ? Number.POSITIVE_INFINITY : Recorded.seq;
				const Recalled =
					Recall(State.Records, Probe) ??
					RecallHistory(Memory.History, Probe, CallPath, State.LearnWindow, Fence) ??
					RecallHistory(State.History, Probe, CallPath, State.LearnWindow, Fence);
				// THE TREE VALIDATION: the store outlives the files it names, so
				// a recorded path becomes a target only when the tree still has it
				// as a regular file, the anchor is excluded, a path in the anchor's
				// own directory wins outright, and otherwise the same release tree
				// ranks first.
				const Files = Recalled === undefined ? [] : Select(Recalled.files, CallPath, Cwd);
				// THE SYNTHETIC FAMILY (the candidate source): the recalled
				// record as ONE pack family, so the classifier, the gate and the
				// note judge it exactly like a resolved pack's family. Its
				// targets are the files touched last time - the agent's OWN
				// previous tool calls, never a literal pack.
				const Synthetic: Intent | undefined =
					Recalled === undefined
						? undefined
						: {
								id: "Repeat",
								priority: 0,
								threshold: 0.75,
								note: "the last time this call was made, these files were touched",
								signals: [{ rule: "history", pattern: ".", weight: 2.5 }],
								targets: Files.map((File) => ({
									path: File,
									prior: 1.0,
									reason: `touched last time (${Recalled.intent})`,
								})),
							};
				// The EXPLICIT pack: `<repo>/.dsh/pack.yml` or the user layer,
				// never the built-in fallback (`builtin: false`). A repo that
				// ships a hand-written `replay/` family still speaks, and the
				// synthesized Repeat family is placed FIRST.
				const Pack = Resolve(Root, { home: Home(), builtin: false });
				const Rows = Pack === undefined ? [] : Families(Pack, "replay");
				const Ordered =
					Synthetic === undefined
						? Rules(Root, Rows)
						: [...Compile([Synthetic]), ...Rules(Root, Rows)];
				if (Ordered.length === 0) {
					Factory.Append(State, "abstained no-history  0.00");
					return Decision;
				}
				const Match = Detect(Ordered, Exec.name, Probe);
				if (Match === null) {
					return Decision;
				}
				// The call was judged under this intent: the recorded entry
				// carries the final label (the persist reads it after the
				// listener returns, so the label is already final).
				if (Recorded !== undefined) {
					Recorded.intent = Match.intent.id;
				}
				// A record with no surviving file abstains `no-companions` (an
				// empty record and a fully vanished one take the same path).
				if (Recalled !== undefined && Files.length === 0) {
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
				// Resolve: the candidates resolve ONLY through the record. An
				// explicit pack supplies the gate and the caveat, never the
				// files.
				if (Recalled === undefined) {
					Factory.Append(
						State,
						`abstained no-memory ${Match.intent.id} ${Match.k.toFixed(2)}`,
					);
					return Decision;
				}
				const Targets: Candidate[] = (Synthetic?.targets ?? [])
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
