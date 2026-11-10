import { isAbsolute, resolve } from "node:path";

import type { Context } from "@deepseek-ai/cordis";
import type { PostToolDecision, ToolExecution } from "@deepseek-ai/dsh-tools";
import type Config from "@Interface/Config.js";
import type { Candidate, Intent } from "@Interface/Pack.js";
import type { AgentMemory } from "@Interface/State.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/ets-base-dsh";
import { Adjacent, Families, Home, Resolve, Root as RootOf } from "@playform/ets-lib-dsh-pack";
import Version from "@Variable/Version.js";

import Detect, { Compile } from "./Detect.js";
import Exists from "./Exists.js";
import History from "./History.js";
import Nodes from "./Nodes.js";
import BuildNote, { BoundSummary, Prepend } from "./Note.js";
import Package from "./Package.js";
import Reconcile from "./Reconcile.js";
import Reconciled from "./Reconciled.js";
import Register from "./Register.js";

/**
 * @module Apply
 *
 * The plugin entry function, a THIN MODULE WIRE-UP in the factory family's
 * shape: build the State through `Factory.State` (the cell unwrap, the shared
 * mappings Ledger<-logFile / Enabled<-log and the module's own fields via the
 * setup `fields` map), emit the durable activation proof (the module's own
 * string, via Factory.Append - the factory never owns ledger strings), and
 * register the hook's OWN listeners.
 *
 * @remarks
 *
 * The listeners:
 *
 *   1. tools/post-execute (waterfall, plain ctx.on - AFTER the CCR
 *      {prepend:true} listener and normalize's post-execute): next() first,
 *      then the RECONCILIATION (the package's smoke claims against the tree,
 *      the wave 2c re-spec), the HISTORY candidates (the files touched right
 *      after this one in this workspace) as ONE synthetic family, the
 *      EXPLICIT pack when one exists, detect, gate, and prepend ONE
 *      additionalContexts notice to the downstream decision. It never
 *      replaces content, only adds contexts, so a ccr-compressed result is
 *      unaffected.
 *   2. agent/pre-step (waterfall, plain): the per-turn reset - the
 *      per-turn note counter when a user message enters (the tool-coach
 *      precedent).
 *
 * THE HISTORY IS A PROJECTION UNIT, NOT A LISTENER FOLD: `session/event` is
 * the durable, all-agent seam, and the supported plugin-facing form of it is
 * `ctx.sessionProjections` - the registry subscribes to `session/event` ONCE
 * and passes every committed event through every registered unit's `apply`
 * (Function/Unit is the unit, Function/Register installs it through the
 * optional `ctx.inject(['sessionProjections'], ...)` form). The hook therefore
 * holds no subscription of its own and folds nothing in this listener: it
 * reads the per-session state at detection time through `stateOf(session,
 * key)` (Function/History). The current call's own `tool/call` is committed
 * BEFORE dispatch - it is the call's STARTED record, the one recovery reports
 * as `TOOL_OUTCOME_UNKNOWN` when no result follows - so the anchor's prior
 * touches, and the anchor itself, are already folded when this listener runs
 * and NO post-execute append is needed (an append would fold the current call
 * twice and inflate every later co-touch count).
 *
 * THE CANDIDATES COME FROM THE AGENT'S OWN PREVIOUS TOOL CALLS: the unit folds
 * every committed `tool/call` that names a path (reads included) through the
 * pack library's `Fold`, and the listener runs
 * `Adjacent(touches, callPath)` to name the files that were touched right
 * after this one in this workspace. The literal built-in pack is NOT a
 * candidate source; the pack survives only as an EXPLICIT override
 * (`<repo>/.dsh/pack.yml` or the user layer), resolved with `builtin: false`.
 * A workspace with no history and no pack abstains
 * (`abstained no-history  0.00`).
 *
 * THE WATERFALL DISCIPLINE (the ccr/tool-coach precedent, live-verified):
 *
 *   - `next()` is ALWAYS awaited FIRST, before any decision;
 *   - pass-through is `return decision` unchanged;
 *   - FAIL-OPEN: every listener body is one try/catch - on any error a
 *     logger.warn records it and the downstream decision is returned
 *     UNCHANGED. A note never fails a tool call.
 *
 * THE WORKSPACE GATE + THE EXISTENCE FILTER: the root is the PACK-INDEPENDENT
 * repo root (the nearest ancestor carrying `.git` or `package.json`, from the
 * call path plus the session cwd). A call outside any workspace has no
 * history to mine here and abstains (`abstained foreign-workspace`); a
 * target absent from all three bases is dropped BEFORE the gate
 * (`abstained no-companions` when the intent's whole target set is gone).
 * The explicit pack's families come from the RESOLVED pack per call
 * (Families(pack, "test")), compiled once per root, so a repo pack overrides
 * the families without a restart.
 *
 * NOT factory machinery, deliberately: no fs/observed Wire, no Attach, no
 * factory Schema - the hook owns its schema (Variable/Config.ts) and its
 * strings. The function returns NOTHING (a returned value silently kills
 * event delivery, live-verified).
 *
 * `inject: ["pluginFactory"]` (Library.ts) - the factory is a REQUIRED
 * service (the State builder + the ledger); the loader's PENDING state
 * handles the ordering, so bundle-layer order never matters. The projection
 * registry is deliberately NOT declared there: it is an OPTIONAL seam the hook
 * registers on through `ctx.inject` and reads through `ctx.get`, so a mount
 * without it still loads (Function/Register, Function/History).
 */
/**
 * Fresh per-agent memory.
 */
const FreshMemory = (): AgentMemory => ({
	Calls: 0,
	Noted: new Map(),
	TurnNotes: 0,
	Ring: [],
	Reconciled: new Map(),
});

/**
 * The path the call names (the file_path argument, then path, then "").
 */
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

	// The reconciliation's per-root clear memo (one clear line per root).
	State.Cleared = new Set();

	// No boot projection: the candidates come from the session history, and
	// only an EXPLICIT repo/user pack compiles (per call, below). The retired
	// projection (Variable/Defaults) is no longer imported.
	State.Rules = [];

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

	// The compile rule for an EXPLICIT pack: the configured intent list
	// filters the families (empty = all), and the config threshold is a FLOOR
	// (the family may raise it).
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

	// The per-root compile memo: an explicit pack's families are compiled
	// once per (root, threshold, intents) tuple, never on every call.
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

	// Durable activation proof - "did it activate" must be answerable from the
	// ledger alone. The second segment is `history` (not an intent count):
	// there is no boot pack, because the candidates come from the session's
	// own tool calls and only an explicit pack may still speak.
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

	// The history fold, installed on the seam that receives the log
	// (Function/Register -> Function/Unit). Registered even when the hook is
	// disabled: the fold is inert bookkeeping that emits nothing, and a
	// VOLATILE re-enable must find the history already folded rather than
	// starting empty.
	Register(Context);

	// Whether a call is judged: only the configured tool names.
	const Judged = (Name: string): boolean =>
		Array.isArray(State.EmitOn) && State.EmitOn.includes(Name);

	// A candidate is dropped when its path sits under one of the exclude
	// prefixes (Target/, node_modules, ...): Target/ is generated, never edit.
	const Excluded = (Path: string): boolean =>
		(State.Exclude ?? []).some((Prefix) => Prefix.length > 0 && Path.includes(Prefix));

	// The note text: the intent header, the capped candidate list with one
	// reason per candidate, and the family's caveat line - bound to
	// maxNoteChars.
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

	// THE RECONCILIATION (the completion spec's wave 2c re-spec): on a judged
	// call in a package, the package's smoke claims are compared with the tree
	// it actually has - the README counts, the folders, the aggregate
	// runner's roster, and (when the workspace graph is present) its `Test`
	// nodes. Read-only: node:fs reads, never ctx.fs, and the only surface is
	// the note. The gate is the intents' gate (cooldown + per-turn cap) plus
	// the dedupe on the drift signature; the consistent tree logs its clear
	// line ONCE per root and stays silent (the documented abstention).
	const ReconcileCall = (
		Memory: AgentMemory,
		Root: string,
		PackageRoot: string | undefined,
		Tool: string,
	): ReturnType<typeof BuildNote> | undefined => {
		switch (true) {
			case PackageRoot === undefined:
				return undefined;
			default:
		}
		const Result = Reconcile(PackageRoot, Root, Nodes(Context, PackageRoot, Root));
		if (Result === undefined) {
			// No Source/Test tree: the package has no smoke claims to reconcile.
			return undefined;
		}
		switch (true) {
			case Result.drifts.length === 0:
				switch (true) {
					case State.Cleared.has(PackageRoot):
						return undefined;
					default:
						State.Cleared.add(PackageRoot);
						Factory.Append(
							State,
							`reconciliation clear ${Result.package} (${Result.expected} expected, ${Result.actual} actual)`,
						);
						return undefined;
				}
			default:
		}
		const Signature = Result.drifts
			.map((Drift) => `${Drift.file}|${Drift.reason}|${Drift.expected}|${Drift.actual}`)
			.join("\n");
		const Verdict = Gate(Memory, "Reconciliation");
		switch (true) {
			case Memory.Reconciled.get(PackageRoot) === Signature:
				Factory.Append(State, `reconciliation skipped deduped ${Result.package}`);
				return undefined;
			case Verdict !== "emit":
				Factory.Append(State, `reconciliation skipped ${Verdict} ${Result.package}`);
				return undefined;
			default:
		}
		Memory.Reconciled.set(PackageRoot, Signature);
		Memory.Noted.set("Reconciliation", Memory.Calls);
		Memory.TurnNotes += 1;
		Factory.Append(
			State,
			`reconciliation drift ${Result.drifts.length} drifts ${Result.package} (${Result.expected} expected, ${Result.actual} actual) call ${Tool}`,
		);
		return BuildNote(
			Reconciled(Result, State.MaxNoteChars),
			BoundSummary(`Reconciliation ${Result.drifts.length} drifts`),
		);
	};

	// ------------------------------------------------------------------
	// Listener 1: tools/post-execute - the reconciliation, the history
	// candidates, the explicit pack's note.
	// ------------------------------------------------------------------
	Context.on(
		"tools/post-execute",
		async (Exec: ToolExecution, _Result: unknown, Next: () => Promise<PostToolDecision>) => {
			// next() FIRST: the downstream listeners settle before any decision.
			const Decision = await Next();
			try {
				if (!State.On || !Judged(Exec.name)) {
					return Decision;
				}
				// The workspace gate, BEFORE any candidate work: the
				// PACK-INDEPENDENT repo root (the nearest ancestor carrying
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
				// The probe: the tool name plus the arguments JSON - the
				// classifier's single text basis (the plan's §3.3 rule shapes).
				const Probe = `${Exec.name} ${JSON.stringify(Exec.arguments ?? {})}`;
				Memory.Ring.unshift(Probe);
				Memory.Ring.length = Math.min(Memory.Ring.length, 8);
				// THE RECONCILIATION, before the candidates: a drift is a fact
				// about the tree, the candidates are a suggestion - when the
				// claims have drifted the note takes the call (one note per
				// family, D9) and the candidate note yields to the next call.
				const ReconciledNote = ReconcileCall(
					Memory,
					Root,
					Package(
						isAbsolute(CallPath) ? CallPath : resolve(Cwd ?? process.cwd(), CallPath),
						Root,
					),
					Exec.name,
				);
				switch (true) {
					case ReconciledNote === undefined:
						break;
					case Decision.kind === "block":
						return {
							kind: "block",
							feedback: Decision.feedback,
							additionalContexts: Prepend(
								ReconciledNote,
								Decision.additionalContexts,
							),
						};
					default:
						return {
							...Decision,
							additionalContexts: Prepend(
								ReconciledNote,
								Decision.additionalContexts,
							),
						};
				}
				// THE HISTORY (the candidate source): the agent's OWN previous
				// tool calls in this workspace, folded per session by the
				// projection unit (Function/Unit) and read through the
				// registry's own face (`stateOf(session, key)`, probed because
				// the registry is an optional service). The pack library's
				// Adjacent scores the co-touches: a repeatedly co-touched path
				// outranks a single one, and a near neighbor outranks a far
				// one. The literal built-in pack is never consulted.
				const Touches = History(
					Context,
					(Exec.agent as { session?: object } | undefined)?.session,
				);
				const Nearby = Adjacent(Touches, CallPath, { limit: State.MaxCandidates });
				// The SYNTHETIC family: the co-touch rows as ONE pack row, so
				// the existing Detect/gate/note pipeline judges them exactly
				// like a resolved pack's family (the `History` header, the
				// `suggest History` line, the cooldown/cap).
				const Synthetic: Intent | undefined =
					Nearby.length === 0
						? undefined
						: {
								id: "History",
								priority: 0,
								threshold: 0.75,
								note: "these files were touched right after this one in this workspace",
								signals: [{ rule: "history", pattern: ".", weight: 2.5 }],
								targets: Nearby.map((Entry) => ({
									path: Entry.path,
									prior: 0.6,
									reason: `touched ${Entry.count} time(s) after this file`,
								})),
							};
				// The EXPLICIT pack: `<repo>/.dsh/pack.yml` or the user layer,
				// never the built-in fallback (`builtin: false`).
				const Pack = Resolve(Root, { home: Home(), builtin: false });
				const Rows = Pack === undefined ? [] : Families(Pack, "test");
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
				// The base-aware existence filter, BEFORE the gate: a target
				// absent from all three bases is dropped; an intent with none
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

	// ------------------------------------------------------------------
	// Listener 3: agent/pre-step - the per-turn reset. When the step's
	// messages end with a user message (a new user turn), the per-turn note
	// counter resets. The listener is a PURE OBSERVER of the counter: next()
	// first, the downstream decision unchanged, fail-open.
	// ------------------------------------------------------------------
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
