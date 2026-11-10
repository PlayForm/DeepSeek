/**
 * @module Apply
 *
 * The plugin entry function: the State build (the factory's cell unwrap plus
 * the volatile refresh), the durable activation proof, the knowledge load, and
 * the FOUR listeners of the suggester's surfaces (plan section 4.2).
 *
 * @remarks
 * The listeners:
 *
 *   1. tools/post-execute (waterfall, plain registration - AFTER the ccr's
 *      {prepend:true} listener and the normalize family, since plain
 *      registration order guarantees it): next() first, then the workspace
 *      root, the HISTORY candidates (the files touched right after this one in
 *      this workspace) as ONE synthetic family, the EXPLICIT pack when one
 *      exists, Detect, Score's gate, and ONE additionalContexts note prepended
 *      to the downstream decision - never a content replacement;
 *   2. agent/pre-step (plain): the per-turn reset (the ring, the cooldown
 *      counters, the dedupe set) when a user message enters, plus the user
 *      text capture for the R12 context bonus;
 *   3. system-prompt/assemble (waterfall, after next()): the optional sticky
 *      section (config sectionMode "sticky"), TTL-rebuilt;
 *   4. tools/change (emit): the sticky section-cache invalidation only.
 *
 * THE HISTORY IS A PROJECTION UNIT, NOT A LISTENER FOLD: `session/event` is
 * the durable, all-agent seam, and the supported plugin-facing form of it is
 * `ctx.sessionProjections` - the registry subscribes to `session/event` ONCE
 * and passes every committed event through every registered unit's `apply`
 * (Function/Unit is the unit, Function/Register installs it through the
 * optional `ctx.inject(['sessionProjections'], ...)` form). The hook therefore
 * holds no subscription of its own and folds nothing in a listener: it reads
 * the per-session state at detection time through `stateOf(session, key)`
 * (Function/History). The judged call's own `tool/call` is committed BEFORE
 * dispatch - it is the call's STARTED record, the one recovery reports as
 * `TOOL_OUTCOME_UNKNOWN` when no result follows - so the anchor's prior
 * touches, and the anchor itself, are already folded when this listener runs
 * and NO post-execute append is needed (an append would fold the current call
 * twice and inflate every later co-touch count).
 *
 * THE CANDIDATES COME FROM THE AGENT'S OWN PREVIOUS TOOL CALLS: the unit folds
 * every committed `tool/call` that names a path (reads included) through the
 * pack library's `Fold`, and the listener runs `Adjacent(touches, anchor)`,
 * where the anchor is the call's own path argument (or the directory of its
 * path-shaped target, or the session cwd), and names the files that were
 * touched right after a similar call in this workspace. The literal built-in
 * pack is NOT a candidate source; the pack survives only as an EXPLICIT
 * override (`<repo>/.dsh/pack.yml` or the user layer), resolved with
 * `builtin: false`. A workspace with no history and no pack abstains
 * (`abstained no-history`).
 *
 * THE WATERFALL DISCIPLINE: `next()` is ALWAYS awaited first; pass-through
 * returns the downstream decision unchanged; FAIL-OPEN: every listener body
 * is one try/catch - on any error a logger.warn records it and the downstream
 * decision is returned UNCHANGED. A note never fails a waterfall.
 *
 * THE WORKSPACE GATE + THE EXISTENCE FILTER: the root is the PACK-INDEPENDENT
 * repo root (the nearest ancestor carrying `.git` or `package.json`, from the
 * call path plus the session cwd). A call outside any workspace has no
 * history to mine here and abstains (`abstained foreign-workspace`); a
 * candidate absent from all three bases is dropped BEFORE the score
 * (`abstained no-companions` when the winner's whole candidate set is gone).
 * The pack's families come from the RESOLVED pack per call
 * (Families(pack, "search")), so an explicit repo pack overrides the search
 * families without a restart; the sticky section resolves the same way.
 *
 * THE NOTE NEVER TOUCHES CONTENT: it is a separate message, so it survives
 * the ccr and cannot be mistaken for file content (plan section 4.6). The
 * learning signals (write/edit/raw-write) are observed for the follow/ignore
 * rules (plan 6.2), never noted - a note after the edit is too late (plan
 * section 3.3).
 *
 * NOT factory machinery, deliberately: no fs/observed Wire, no Attach, no
 * factory Schema - the suggester owns its schema (Variable/Config) and its
 * strings. The function returns NOTHING; test probes (the end-phase) read
 * the state through the `ctx.__hookDshSearchSuggesterState` attachment.
 *
 * THE P2 GRAPH PROJECTION (the re-spec): the candidate scoring reads the
 * optional `ctx.workspaceGraph` through a lazily built projection
 * (Function/Projection, the shape in Interface/Projection.ts - NOT the
 * session-projection seam, which lives in Interface/Session.ts) - a present
 * graph proves the candidate (node exists,
 * kind expected, depth, recency), an absent or empty graph falls back to the
 * documented neutral literal 0.5. The projection is cached and rebuilt on
 * `tools/change` while `refreshOnBoot` holds; the sticky section renders the
 * projected index (Function/Projected) instead of the plain candidate list
 * when the graph proves any candidate. No ledger string is added by the
 * projection: the note and the section are the evidence.
 *
 * THE P3 OFFLINE SEED and THE P4 DISMISS TOOL: at load the knowledge is
 * seeded from the EXPLICIT pack's canonical candidates plus the projection
 * (Function/Seed; no LLM, no session history) unless `learn`/`seed` are off -
 * a repo without an explicit pack seeds nothing; the `suggestion_dismiss`
 * tool (Function/Dismiss) is registered through the loader's tool API when
 * the host exposes `ctx.tools` - the batch-decision precedent, a guarded
 * registration so a bare mount still applies.
 */
import { dirname } from "node:path";

import type { Context } from "@deepseek-ai/cordis";
import type { UserMessage } from "@deepseek-ai/dsh-llm";
import type { AssembleContext, PromptAssembly } from "@deepseek-ai/dsh-system-prompt";
import type { PostToolDecision, ToolExecution, ToolExecutionResult } from "@deepseek-ai/dsh-tools";
import { Activate } from "@playform/ets-base-dsh";
import { Adjacent, Families, Home, Resolve, Root as RootOf } from "@playform/ets-lib-dsh-pack";

import type Config from "../Interface/Config.js";
import type { CallView, Intent, Verdict } from "../Interface/Execution.js";
import type Projection from "../Interface/Projection.js";
import type State from "../Interface/State.js";
import Version from "../Variable/Version.js";
import Detect from "./Detect.js";
import DismissTool from "./Dismiss.js";
import Filter from "./Filter.js";
import ReadHistory from "./History.js";
import { Match } from "./Measure.js";
import BuildNote, { Prepend, Text } from "./Note.js";
import Load, { Dismissed, Emitted, Followed, Ignored, Row, Save } from "./Persist.js";
import Projected from "./Projected.js";
import BuildProjection from "./Projection.js";
import Register from "./Register.js";
import Ring, { type RingState } from "./Ring.js";
import Score, { NoteKey } from "./Score.js";
import Seed from "./Seed.js";

/**
 * The learning-only tools: observed for the follow/ignore rules, never noted.
 */
const Learning = ["write", "edit", "raw-write"];

/**
 * The synthetic family's id (the history source's ledger name). The
 * detection-time read is imported as `ReadHistory`, because this module owns
 * the family id under the plain name.
 */
const History = "History";

/**
 * The call view of one judged call (plan section 3.3): the classified text.
 */
const View = (Exec: ToolExecution): CallView => {
	const Args = (Exec.arguments ?? {}) as Record<string, unknown>;
	switch (true) {
		case Exec.name === "bash":
			return { name: Exec.name, text: String(Args["command"] ?? ""), path: "" };
		case typeof Args["pattern"] === "string":
			return {
				name: Exec.name,
				text: String(Args["pattern"]),
				path: typeof Args["path"] === "string" ? Args["path"] : "",
			};
		case typeof Args["file_path"] === "string":
			return {
				name: Exec.name,
				text: String(Args["file_path"]),
				path: String(Args["file_path"]),
			};
		default:
			return { name: Exec.name, text: JSON.stringify(Args ?? {}), path: "" };
	}
};

/**
 * The anchor path of a judged call, the path the history is folded against:
 * the call's own `path`/`file_path` argument when it carries one, otherwise
 * the directory of the call's target argument when that target is a path
 * (`Args.target` first, then the classified text), otherwise the session cwd.
 * The fold normalizes the touches the same way (backslashes to slashes, no
 * leading `./`), so an absolute and a relative spelling of one file meet.
 */
const AnchorOf = (Call: CallView, Exec: ToolExecution, Cwd: string | undefined): string => {
	if (Call.path.length > 0) {
		return Call.path;
	}
	const Args = (Exec.arguments ?? {}) as Record<string, unknown>;
	const Target = typeof Args["target"] === "string" ? Args["target"] : Call.text;
	if (Target.length > 0 && Target.includes("/")) {
		return dirname(Target);
	}
	return Cwd ?? "";
};

/**
 * The SYNTHETIC family: the co-touch candidates as ONE pack row, so the
 * existing Detect/Filter/Score pipeline judges them exactly like a resolved
 * pack's family (the `History` note header, the `suggest History` line, the
 * follow-through). `undefined` when the adjacency yields nothing.
 */
const Synthetic = (Rows: readonly { path: string; count: number }[]): Intent | undefined =>
	Rows.length === 0
		? undefined
		: {
				id: History,
				priority: 0,
				threshold: 0.75,
				note: "these files were touched right after similar calls in this workspace",
				familyGlobs: [],
				signals: [{ rule: "history", pattern: ".", weight: 2.5 }],
				targets: Rows.map((Entry) => ({
					path: Entry.path,
					kind: "",
					prior: 0.6,
					reason: `touched ${Entry.count} time(s) after a similar call`,
				})),
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
 * The user text of the step: the last user message's text content, lowercased.
 */
const UserText = (Payload: unknown): string => {
	const Step = Payload as { messages?: { role?: string; content?: unknown }[] } | undefined;
	const Message = Array.isArray(Step?.messages)
		? [...Step.messages].reverse().find((Entry) => Entry?.role === "user")
		: undefined;
	const Content = Message?.content;
	if (typeof Content === "string") {
		return Content.toLowerCase();
	}
	if (Array.isArray(Content)) {
		return Content.map((Block) =>
			typeof Block === "object" && Block !== null && "text" in Block
				? String((Block as { text: unknown }).text)
				: "",
		)
			.join(" ")
			.toLowerCase();
	}
	return "";
};

/**
 * The enabled pack, filtered to the config's intent kinds (order kept).
 */
const Enabled = (State: State, List: Intent[]) =>
	List.filter((Intent) => State.Intents.includes(Intent.id));

/**
 * The learning verdict for an open note whose window has closed untouched
 * (plan 6.2).
 */
const LearnTail = (Context: Context, State: State, Rings: RingState): void => {
	if (!State.Learn || Rings.pending === undefined) {
		return;
	}
	if (Rings.pending.since >= State.LearnWindow) {
		Ignored(State.Knowledge, Rings.pending.intent);
		FactoryAppend(Context, State, `ignored ${Rings.pending.intent}`);
		Save(State.Knowledge, State.PersistPath);
		Rings.pending = undefined;
		Rings.emitted = [];
	}
};

/**
 * The ledger append helper (the factory's Append, with the state bound).
 */
const FactoryAppend = (Context: Context, State: State, Message: string): void => {
	try {
		State.Factory.Append(State, Message);
	} catch (Error) {
		try {
			Context.logger?.warn(
				`hook-dsh-search-suggester: ${String(Error)}; the ledger line is dropped`,
			);
		} catch {
			/* logger optional */
		}
	}
};

/**
 * Prepend the note to the downstream decision's additionalContexts.
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
	// The State: the factory's shared shape plus the suggester's own fields,
	// copied from the (cell-unwrapped) validated config by the setup map.
	// Every volatile field refreshes in place via the factory's loader
	// listener - a flip (threshold, cooldownCalls, ...) lands on the next
	// judged call without a remount.
	const Factory = Context.pluginFactory;
	const State: State = Factory.State<State>(Context, Options, {
		module: "hook-dsh-search-suggester",
		fields: {
			On: "enabled",
			Threshold: "threshold",
			MaxCandidates: "maxCandidates",
			MaxNoteChars: "maxNoteChars",
			CooldownCalls: "cooldownCalls",
			MaxNotesPerTurn: "maxNotesPerTurn",
			Intents: "intents",
			EmitOn: "emitOn",
			ScopeRoots: "scopeRoots",
			Exclude: "exclude",
			Learn: "learn",
			LearnWindow: "learnWindow",
			PersistPath: "persistPath",
			IndexPath: "indexPath",
			RefreshOnBoot: "refreshOnBoot",
			DismissTtl: "dismissTtl",
			Seed: "seed",
			SectionMode: "sectionMode",
			SectionTtl: "sectionTtl",
		},
	});
	State.Factory = Factory;

	// No boot projection of the built-in pack: the candidates come from the
	// session history, and only an EXPLICIT repo/user pack compiles (per
	// call, below).
	State.Pack = [];
	State.Knowledge = Load(State.PersistPath);
	State.Rings = Ring();

	// THE HISTORY IS NOT A STATE FIELD: the per-session touch history is a
	// session-projection unit (Function/Unit, keyed on `sessionProjections`),
	// so the registry owns one cell per session and Function/History reads it
	// at detection time through `stateOf(session, key)`. Nothing here holds
	// it, and no WeakMap in this module is keyed on the session object.

	// ------------------------------------------------------------------
	// The graph projection cache (the P2 re-spec). The graph service is
	// probed lazily on the first read; a present graph is cached until
	// tools/change (refreshOnBoot), a missing/empty graph is re-probed on the
	// next read (cheap - the expensive snapshot only runs when the service
	// answers with nodes).
	// ------------------------------------------------------------------
	let Cached: Projection | undefined;
	let Built = false;
	const Project = (): Projection | undefined => {
		if (!Built) {
			Cached = BuildProjection(Context);
			Built = Cached !== undefined;
		}
		return Cached;
	};

	// ------------------------------------------------------------------
	// The P3 offline seed: the EXPLICIT pack's canonical candidates (the
	// built-in pack is retired), proven twice when the graph already sees
	// them. A repo without an explicit pack seeds nothing and leaves the
	// knowledge's seed marker alone. It mutates the in-memory knowledge only;

	// the next real save (an emit, a follow, a dismissal) persists it, so a
	// cold start leaves no file behind.
	// ------------------------------------------------------------------
	if (State.On && State.Learn && State.Seed) {
		const Graph = Project();
		const Boot = RootOf(".", undefined);
		const Pack =
			Boot === undefined ? undefined : Resolve(Boot, { home: Home(), builtin: false });
		const Rows = Pack === undefined ? [] : Enabled(State, Families(Pack, "search"));
		if (Rows.length > 0) {
			Seed(State.Knowledge, Rows, Graph, Math.floor(Date.now() / 1000));
		}
	}

	// Durable activation proof - "did it activate" must be answerable from the
	// ledger alone. The second segment is `history` (not a family count):
	// there is no boot pack, because the candidates come from the session's
	// own tool calls and only an explicit pack may still speak. Format:
	//   search-suggester: activated (bundle 0.2.1, history, threshold 0.75)
	if (!State.On) {
		Factory.Append(State, "disabled (enabled=false)");
	} else {
		Factory.Append(
			State,
			Activate([
				["", `bundle ${Version}`],
				["", "history"],
				["", `threshold ${State.Threshold}`],
			]),
		);
	}

	// ------------------------------------------------------------------
	// The history fold, installed on the seam that receives the log
	// (Function/Register -> Function/Unit). Registered even when the hook is
	// disabled: the fold is inert bookkeeping that emits nothing, and a
	// VOLATILE re-enable must find the history already folded rather than
	// starting empty.
	// ------------------------------------------------------------------
	Register(Context);

	// ------------------------------------------------------------------
	// Listener 1: tools/post-execute - the note (and the learning signals).
	// ------------------------------------------------------------------
	Context.on(
		"tools/post-execute",
		async (
			Exec: ToolExecution,
			_Result: Readonly<ToolExecutionResult>,
			Next: () => Promise<PostToolDecision>,
		): Promise<PostToolDecision> => {
			// next() FIRST: the downstream listeners settle before any decision.
			const Downstream = await Next();
			try {
				if (!State.On) {
					return Downstream;
				}
				const Rings = State.Rings.State(Exec.agent);
				// The learning-only tools: the follow signal (a candidate path
				// touched), then the ring entry as an edit (it clears the loop
				// credit and closes the pending note's window).
				if (Learning.includes(Exec.name)) {
					const EditPath = View(Exec).path;
					if (State.Learn && Rings.pending !== undefined) {
						const Intent = Rings.pending.intent;
						// The follow signal reads the note's OWN candidate set
						// (never the learned rows): a candidate the model
						// touched within the window is a follow.
						const Hit = Rings.emitted.find((Path) => Match(Path, EditPath));
						if (Hit !== undefined) {
							Followed(State.Knowledge, Intent, Hit, Math.floor(Date.now() / 1000));
							FactoryAppend(Context, State, `followed ${Intent} ${Hit}`);
							Save(State.Knowledge, State.PersistPath);
							Rings.pending = undefined;
							Rings.emitted = [];
						}
					}
					State.Rings.Push(
						Rings,
						{ name: Exec.name, text: "", path: EditPath },
						"edit",
						true,
					);
					return Downstream;
				}
				if (!State.EmitOn.includes(Exec.name)) {
					return Downstream;
				}
				const Call = View(Exec);
				// The workspace gate, BEFORE any candidate work: the
				// PACK-INDEPENDENT repo root (the nearest ancestor carrying
				// `.git` or `package.json`) from the call path plus the
				// session cwd. A call outside any workspace has no history to
				// mine here and abstains.
				const Cwd = Session(Context, Exec);
				const Root = RootOf(Call.path, Cwd);
				if (Root === undefined) {
					FactoryAppend(Context, State, "abstained foreign-workspace  0.00");
					return Downstream;
				}
				// The open note's learning tail, then the cooldown aging.
				LearnTail(Context, State, Rings);
				State.Rings.Tick(Rings, State.CooldownCalls);
				if (Rings.pending !== undefined) {
					Rings.pending.since += 1;
				}
				// THE HISTORY (the candidate source): the agent's OWN previous
				// tool calls in this workspace, folded per session by the
				// projection unit (Function/Unit) and read back through the
				// registry's own face (`stateOf(session, key)`), then scored by
				// the pack library's Adjacent. A repeatedly co-touched path
				// outranks a single one, and a near neighbour outranks a far
				// one. The literal built-in pack is never consulted.
				const Touches = ReadHistory(
					Context,
					(Exec.agent as { session?: object } | undefined)?.session,
				);
				const Anchor = AnchorOf(Call, Exec, Cwd);
				const Nearby = Adjacent(Touches, Anchor, { limit: State.MaxCandidates });
				const Row_ = Synthetic(Nearby);
				// The EXPLICIT pack: `<repo>/.dsh/pack.yml` or the user layer,
				// never the built-in fallback (`builtin: false`).
				const Pack = Resolve(Root, { home: Home(), builtin: false });
				const Rows = Pack === undefined ? [] : Enabled(State, Families(Pack, "search"));
				const Rules = Row_ === undefined ? Rows : [Row_, ...Rows];
				if (Rules.length === 0) {
					FactoryAppend(Context, State, "abstained no-history  0.00");
					return Downstream;
				}
				// The base-aware existence filter: a candidate absent from all
				// three bases is dropped before the score/gate step.
				const Detections = Filter(
					Detect(Rules, Call, State.Rings.Intents(Rings), Rings.userText),
					Call.path,
					Root,
					Cwd,
				);
				const Verdict: Verdict =
					Detections.length === 0
						? { action: "abstain", reason: "no-signal", kappa: 0, candidates: [] }
						: Score(Detections, {
								Cooled: [...Rings.cooled.keys()],
								Noted: Rings.cooledNoted,
								Recent: new Set(Rings.recent.keys()),
								Notes: Rings.notes,
								MaxNotes: State.MaxNotesPerTurn,
								Threshold: State.Threshold,
								MaxCandidates: State.MaxCandidates,
								Exclude: State.Exclude,
								History: (Intent, Path) => Row(State.Knowledge, Intent, Path),
								Dismissed: (Intent, Path) =>
									Dismissed(
										State.Knowledge,
										Intent,
										Path,
										Math.floor(Date.now() / 1000),
									),
								Projection: Project(),
							});
				const IntentId = Detections[0]?.intent.id ?? "";
				switch (Verdict.action) {
					case "emit": {
						const Paths = Verdict.candidates.map((Candidate) => Candidate.path);
						const Body = Text(
							IntentId,
							Verdict.kappa,
							Verdict.candidates,
							State.MaxNoteChars,
						);
						const Note = BuildNote(Body, `${IntentId} ${Verdict.kappa.toFixed(2)}`);
						State.Rings.Mark(Rings, IntentId, Paths, NoteKey(IntentId, Paths));
						Emitted(
							State.Knowledge,
							IntentId,
							String((Exec as { id?: string }).id ?? ""),
							Verdict.kappa,
							Paths,
							Math.floor(Date.now() / 1000),
						);
						Save(State.Knowledge, State.PersistPath);
						FactoryAppend(
							Context,
							State,
							`suggest ${IntentId} ${Verdict.kappa.toFixed(2)} ${Paths.length} candidates`,
						);
						State.Rings.Push(Rings, Call, IntentId, false);
						return Attach(Downstream, Note);
					}
					case "suppress":
						FactoryAppend(Context, State, `suppressed ${Verdict.reason} ${IntentId}`);
						break;
					default:
						FactoryAppend(
							Context,
							State,
							`abstained ${Verdict.reason} ${IntentId} ${Verdict.kappa.toFixed(2)}`,
						);
						break;
				}
				State.Rings.Push(Rings, Call, IntentId, false);
				return Downstream;
			} catch (Error) {
				// Fail-open: never throw into the waterfall.
				try {
					Context.logger?.warn(
						`hook-dsh-search-suggester: ${String(Error)}; the call passes through unnoted`,
					);
				} catch {
					/* logger optional */
				}
				return Downstream;
			}
		},
	);

	// ------------------------------------------------------------------
	// Listener 2: agent/pre-step - the per-turn reset and the user text.
	// ------------------------------------------------------------------
	Context.on("agent/pre-step", async (Payload, Next) => {
		// next() FIRST.
		const Downstream = await Next();
		try {
			if (!State.On) {
				return Downstream;
			}
			const Step = Payload as {
				agent?: unknown;
				messages?: { source?: { kind?: string } }[];
			};
			const Rings = State.Rings.State(Step.agent);
			Rings.userText = UserText(Payload);
			if (
				Array.isArray(Step.messages) &&
				Step.messages.some((Entry) => Entry?.source?.kind === "user")
			) {
				State.Rings.Reset(Rings);
			}
		} catch (Error) {
			try {
				Context.logger?.warn(
					`hook-dsh-search-suggester: ${String(Error)}; the reset is skipped`,
				);
			} catch {
				/* logger optional */
			}
		}
		return Downstream;
	});

	// ------------------------------------------------------------------
	// Listener 3: system-prompt/assemble - the sticky section (opt-in,
	// sectionMode "sticky"): the most recent family's target list, rebuilt on
	// a TTL (plan 4.6, second surface). Off by default. The section is
	// source-aware: the synthetic History row renders the ring's own emitted
	// paths, and an EXPLICIT pack renders its family (never the built-in one).
	// ------------------------------------------------------------------
	Context.on(
		"system-prompt/assemble",
		async (
			_Assembly: PromptAssembly,
			AssembleContext: AssembleContext,
			Next: () => Promise<PromptAssembly>,
		): Promise<PromptAssembly> => {
			// next() FIRST: the downstream assembly settles first.
			const Downstream = await Next();
			try {
				if (!State.On || State.SectionMode !== "sticky") {
					return Downstream;
				}
				const Rings = State.Rings.State(AssembleContext?.agent);
				const Recent = [...Rings.cooled.keys()];
				if (Recent.length === 0) {
					return Downstream;
				}
				const Last = Recent[Recent.length - 1] ?? "";
				// The synthetic row: the paths the last note named, with the
				// one generic history reason (the note's own reasons are not
				// cached, and the section is a reminder, not a record).
				const HistoryRow: Intent | undefined =
					Last !== History || Rings.emitted.length === 0
						? undefined
						: {
								id: History,
								priority: 0,
								threshold: 0.75,
								note: "these files were touched right after similar calls in this workspace",
								familyGlobs: [],
								signals: [],
								targets: Rings.emitted.map((Path) => ({
									path: Path,
									kind: "",
									prior: 0.6,
									reason: "touched after a similar call",
								})),
							};
				const Boot = HistoryRow === undefined ? RootOf(".", undefined) : undefined;
				const Pack =
					Boot === undefined
						? undefined
						: Resolve(Boot, { home: Home(), builtin: false });
				const Intent =
					HistoryRow ??
					(Pack === undefined
						? undefined
						: Families(Pack, "search").find((Row_) => Row_.id === Last));
				if (Intent === undefined) {
					return Downstream;
				}
				const Stale =
					Rings.sectionBuilt === undefined ||
					Rings.calls - Rings.sectionBuilt >= State.SectionTtl;
				if (Stale) {
					// The P2 re-spec: the section renders the PROJECTED INDEX
					// (the top graph paths for the family) when the graph
					// proves a candidate, and the plain candidate list
					// otherwise (the neutral fallback).
					const Graph = Project();
					const ProjectedRows =
						Graph === undefined
							? undefined
							: Projected(Graph, Intent, State.MaxCandidates);
					Rings.sectionText = Text(
						Intent.id,
						1,
						ProjectedRows ??
							Intent.targets.map((Target) => ({
								path: Target.path,
								reason: Target.reason,
							})),
						State.MaxNoteChars,
					);
					Rings.sectionBuilt = Rings.calls;
					FactoryAppend(Context, State, `section rebuilt (ttl ${State.SectionTtl})`);
				}
				return {
					...Downstream,
					sections: [
						...Downstream.sections,
						{ name: "hook-dsh-search-suggester", text: Rings.sectionText ?? "" },
					],
				};
			} catch (Error) {
				try {
					Context.logger?.warn(
						`hook-dsh-search-suggester: ${String(Error)}; the assembly passes through`,
					);
				} catch {
					/* logger optional */
				}
				return Downstream;
			}
		},
	);

	// ------------------------------------------------------------------
	// Listener 4: tools/change - the projection refresh (refreshOnBoot) and
	// the sticky section-cache invalidation (the section cache lives on the
	// per-agent rings; the default ring's cache is cleared here, every other
	// ring expires through the TTL).
	// ------------------------------------------------------------------
	Context.on("tools/change", (): void => {
		try {
			if (!State.On) {
				return;
			}
			// The projection refresh: the graph may have re-indexed with the
			// tool registry change (refreshOnBoot); the next read rebuilds it.
			if (State.RefreshOnBoot) {
				Cached = undefined;
				Built = false;
			}
			const Rings = State.Rings.State(undefined);
			if (Rings.sectionText !== undefined) {
				Rings.sectionText = undefined;
				Rings.sectionBuilt = undefined;
				FactoryAppend(Context, State, "section invalidated (tools/change)");
			}
		} catch (Error) {
			try {
				Context.logger?.warn(
					`hook-dsh-search-suggester: ${String(Error)}; the cache survives`,
				);
			} catch {
				/* logger optional */
			}
		}
	});

	// ------------------------------------------------------------------
	// Tool T1: suggestion_dismiss (the P4 dismissal path). Registration is
	// readonly after registration; the definition is built once here, and the
	// guarded access keeps a bare mount (no ctx.tools) applying cleanly (the
	// batch-decision precedent).
	// ------------------------------------------------------------------
	const Tools = (
		Context as unknown as { tools?: { register?: (definition: unknown) => () => void } }
	).tools;
	if (typeof Tools?.register === "function") {
		Tools.register(DismissTool(State, (Message) => FactoryAppend(Context, State, Message)));
	}

	// The loader ignores any return value; the end-phase smoke probes the
	// built State through this debug attachment instead.
	(Context as { __hookDshSearchSuggesterState?: State }).__hookDshSearchSuggesterState = State;
};
