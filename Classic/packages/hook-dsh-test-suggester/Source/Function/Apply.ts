// Apply - the plugin entry function, a THIN MODULE WIRE-UP in the factory
// family's shape: build the State through `Factory.State` (the cell unwrap,
// the shared mappings Ledger←logFile / Enabled←log and the module's own
// fields via the setup `fields` map), emit the durable activation proof (the
// module's own string, via Factory.Append - the factory never owns ledger
// strings), compile the pack ONCE, and register the hook's OWN listeners:
//
//   1. tools/post-execute (waterfall, plain ctx.on - AFTER the CCR
//      {prepend:true} listener and normalize's post-execute): next() first,
//      the RECONCILIATION (the package's smoke claims against the tree, the
//      wave 2c re-spec), then detect, gate, and prepend ONE
//      additionalContexts notice to the downstream decision. It never
//      replaces content, only adds contexts, so a ccr-compressed result is
//      unaffected.
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
// THE WORKSPACE GATE + THE EXISTENCE FILTER: the pack is the repo's own
// convention graph (the built-in pack when the repo has no pack file), so the
// listener resolves the workspace root first (the nearest ancestor whose
// pack signature matches; the built-in default is
// Documentation/ARCHIVE-STYLE.md, from the call path plus the session cwd).
// A foreign workspace has no pack and abstains (`abstained foreign-workspace`);
// a target absent from all three bases is dropped BEFORE the gate
// (`abstained no-companions` when the intent's whole target set is gone).
// The intents come from the RESOLVED pack per call (Families(pack, "test")),
// compiled once per root, so a repo pack overrides the built-in intents
// without a restart.
//
// NOT factory machinery, deliberately: no fs/observed Wire, no Attach, no
// factory Schema - the hook owns its schema (Variable/Config.ts) and its
// strings. The function returns NOTHING (a returned value silently kills
// event delivery, live-verified).
//
// `inject: ["pluginFactory"]` (Library.ts) - the factory is a REQUIRED
// service (the State builder + the ledger); the loader's PENDING state
// handles the ordering, so bundle-layer order never matters.
import { isAbsolute, resolve } from "node:path";

import type { Context } from "@deepseek-ai/cordis";
import type { PostToolDecision, ToolExecution } from "@deepseek-ai/dsh-tools";
import type Config from "@Interface/Config.js";
import type { Candidate } from "@Interface/Pack.js";
import type { AgentMemory } from "@Interface/State.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/lib-dsh-core";
import { Families, Locate } from "@playform/lib-dsh-pack";
import Defaults from "@Variable/Defaults.js";

import Detect, { Compile } from "./Detect.js";
import Exists from "./Exists.js";
import Nodes from "./Nodes.js";
import BuildNote, { BoundSummary, Prepend } from "./Note.js";
import Package from "./Package.js";
import Reconcile from "./Reconcile.js";
import Reconciled from "./Reconciled.js";

// The bundle version, mirrored from package.json (the activation proof's
// first field; a release bumps both together).
const Version = "0.1.0";

/** Fresh per-agent memory. */
const FreshMemory = (): AgentMemory => ({
	Calls: 0,
	Noted: new Map(),
	TurnNotes: 0,
	Ring: [],
	Reconciled: new Map(),
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
				// The workspace gate, BEFORE detect/score: the pack is the
				// repo's convention graph (the built-in pack when the repo has
				// no pack file), so a call that belongs to another workspace
				// has nothing to name here. The signature comes from the pack
				// (default: Documentation/ARCHIVE-STYLE.md).
				const CallPath = Path(Exec);
				const Cwd = Session(Context, Exec);
				const Located = Locate(CallPath, Cwd);
				if (Located === undefined) {
					Factory.Append(State, "abstained foreign-workspace  0.00");
					return Decision;
				}
				// The resolved pack's intents, compiled once per root (the
				// built-in compile covers the no-pack path).
				const Intents = Rules(Located.root, Families(Located.pack, "test"));
				const Memory = Agent(Exec.agent);
				Memory.Calls += 1;
				// The probe: the tool name plus the arguments JSON - the
				// classifier's single text basis (the plan's §3.3 rule shapes).
				const Probe = `${Exec.name} ${JSON.stringify(Exec.arguments ?? {})}`;
				Memory.Ring.unshift(Probe);
				Memory.Ring.length = Math.min(Memory.Ring.length, 8);
				// THE RECONCILIATION, before the intents: a drift is a fact
				// about the tree, the pack targets are a suggestion - when the
				// claims have drifted the note takes the call (one note per
				// family, D9) and the intent note yields to the next call.
				const ReconciledNote = ReconcileCall(
					Memory,
					Located.root,
					Package(
						isAbsolute(CallPath) ? CallPath : resolve(Cwd ?? process.cwd(), CallPath),
						Located.root,
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
				const Match = Detect(Intents, Exec.name, Probe);
				if (Match === null) {
					return Decision;
				}
				// The base-aware existence filter, BEFORE the gate: a target
				// absent from all three bases is dropped; an intent with none
				// left abstains.
				const Existing = Match.intent.targets.filter((Target) =>
					Exists(Target.path, CallPath, Located.root, Cwd),
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
