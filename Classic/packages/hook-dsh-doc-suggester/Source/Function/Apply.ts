// Apply - the plugin entry function: the State build (the factory's cell
// unwrap + the volatile refresh), the durable activation proof, the learned
// layer, and the TWO listeners of the doc suggester's surfaces:
//
//   1. tools/post-execute (waterfall, plain registration): next() first,
//      then the doc path the call names, the workspace gate (a foreign
//      workspace abstains), the base-aware existence filter (companions
//      absent from all three bases are dropped), the learning FOLLOW-THROUGH
//      (an open note's companion named by this call is an accept; the window
//      ages otherwise), Detect, Score's gate, and ONE additionalContexts note
//      naming the doc-graph companions not yet touched - never a content
//      replacement;
//   2. agent/pre-step (plain): the per-turn reset (touched paths, cooldowns,
//      dedupe, counters, the open note) when a user message enters.
//
// THE WATERFALL DISCIPLINE: `next()` is ALWAYS awaited first; pass-through
// returns the downstream decision unchanged; FAIL-OPEN: every listener body
// is one try/catch - on any error a logger.warn records it and the
// downstream decision is returned UNCHANGED. A note never fails a waterfall.
//
// THE NOTE NEVER TOUCHES CONTENT: it names the companions that keep the doc
// graph coherent (the INDEX row, the frontmatter block, the site mirror);
// deciding the change is the model's.
//
// THE WORKSPACE GATE + THE EXISTENCE FILTER: the pack is the repo's own
// convention graph (the built-in pack when the repo has no pack file), so the
// listener resolves the workspace root first (the nearest ancestor whose
// pack signature matches; the built-in default is
// Documentation/ARCHIVE-STYLE.md, from the call path plus the session cwd).
// A foreign workspace has no pack and abstains (`abstained foreign-workspace`);
// a companion absent from all three bases is dropped BEFORE the score
// (`abstained no-companions` when the winner's whole companion set is gone).
// The families come from the RESOLVED pack per call (Families(pack, "doc")),
// so a repo pack overrides the built-in families without a restart.
//
// THE D8 LEARNING LAYER (completion spec 00-OVERVIEW D8 + 03-SUGGESTERS
// section 2): every emitted note - and every gated silence worth learning
// from (`low-confidence`, `already-touched`) - records a DECISION through
// Function/Decide: the family, the companion rows with their six pickable
// heuristic values, the effective weight table and the enabled list, and the
// `pending` outcome placeholder. The record is stored through the optional
// pattern service (`ctx.get("pattern")`, probed per use, never injected) and
// in the bounded memory fallback otherwise (Function/Store). The note opens a
// follow-through window; a later call that names a companion is an ACCEPT for
// that companion and its family, and a window that reaches `learnWindow`
// judged calls untouched is a soft REJECT - both fill the record's outcome
// and move the learned rates the `history`/`accept` heuristics read.
//
// NOT factory machinery, deliberately: no fs/observed Wire, no Attach, no
// factory Schema - the suggester owns its schema (Variable/Config) and its
// strings. The function returns NOTHING; test probes (the end-phase) read
// the state through the `ctx.__hookDshDocSuggesterState` attachment.
import type { Context } from "@deepseek-ai/cordis";
import type { UserMessage } from "@deepseek-ai/dsh-llm";
import type { PostToolDecision, ToolExecution, ToolExecutionResult } from "@deepseek-ai/dsh-tools";
import { Activate } from "@playform/lib-dsh-core";
import { Families, Locate } from "@playform/lib-dsh-pack";

import type Config from "../Interface/Config.js";
import type { DocView, Verdict } from "../Interface/Execution.js";
import type State from "../Interface/State.js";
import Decide from "./Decide.js";
import Decided from "./Decided.js";
import Detect from "./Detect.js";
import Filter from "./Filter.js";
import type { MeasureInput } from "./Measure.js";
import BuildNote, { Prepend, Text } from "./Note.js";
import Pack from "./Pack.js";
import Ring, { type RingState } from "./Ring.js";
import Score, { NoteKey } from "./Score.js";
import Store from "./Store.js";
import Weights from "./Weights.js";
import Would from "./Would.js";

// The bundle version, mirrored from package.json (the activation proof's
// first field; a release bumps both together).
const Version = "0.1.0";

/** The doc-task call's view: the doc path the call names. */
const View = (Exec: ToolExecution): DocView => {
	const Args = (Exec.arguments ?? {}) as Record<string, unknown>;
	const Path =
		typeof Args["file_path"] === "string"
			? Args["file_path"]
			: typeof Args["path"] === "string"
				? Args["path"]
				: "";
	return { name: Exec.name, path: Path };
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

/** The ledger append helper (the factory's Append, fail-safe). */
const FactoryAppend = (Context: Context, State: State, Message: string): void => {
	try {
		State.Factory.Append(State, Message);
	} catch (Error) {
		try {
			Context.logger?.warn(
				`hook-dsh-doc-suggester: ${String(Error)}; the ledger line is dropped`,
			);
		} catch {
			/* logger optional */
		}
	}
};

/** Prepend the note to the downstream decision's additionalContexts. */
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
	// listener - a flip (threshold, cooldownCalls, learnWindow, weights, ...)
	// lands on the next judged call without a remount.
	const Factory = Context.pluginFactory;
	const State: State = Factory.State<State>(Context, Options, {
		module: "hook-dsh-doc-suggester",
		fields: {
			On: "enabled",
			Threshold: "threshold",
			Tools: "tools",
			MaxCompanions: "maxCompanions",
			MaxNoteChars: "maxNoteChars",
			CooldownCalls: "cooldownCalls",
			MaxNotesPerTurn: "maxNotesPerTurn",
			Exclude: "exclude",
			Learn: "learn",
			LearnWindow: "learnWindow",
			Heuristics: "heuristics",
			Weights: "weights",
			StoreLimit: "storeLimit",
		},
	});
	State.Factory = Factory;
	State.Pack = Pack;
	State.Rings = Ring();
	// The learned layer: the pattern service when the host provides one, the
	// bounded memory fallback otherwise (probed per use - the service may load
	// after this plugin).
	State.Learning = Store(Context, "hook-dsh-doc-suggester", State.StoreLimit);

	// Durable activation proof - "did it activate" must be answerable from the
	// ledger alone:
	//   doc-suggester: activated (bundle 0.1.0, families 7, threshold 0.75)
	if (!State.On) {
		Factory.Append(State, "disabled (enabled=false)");
	} else {
		Factory.Append(
			State,
			Activate([
				["", `bundle ${Version}`],
				["", `families ${State.Pack.length}`],
				["", `threshold ${State.Threshold}`],
			]),
		);
	}

	// ------------------------------------------------------------------
	// Listener 1: tools/post-execute - the doc-graph companions note and the
	// follow-through.
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
				if (!State.On || !State.Tools.includes(Exec.name)) {
					return Downstream;
				}
				const Rings = State.Rings.State(Exec.agent);
				State.Rings.Tick(Rings, State.CooldownCalls);
				const Call = View(Exec);
				if (Call.path === "") {
					return Downstream;
				}
				// The workspace gate, BEFORE detect/score: the pack is the
				// repo's doc graph (the built-in pack when the repo has no
				// pack file), so a call that belongs to another workspace has
				// nothing to name here. The signature comes from the pack
				// (default: Documentation/ARCHIVE-STYLE.md).
				const Cwd = Session(Context, Exec);
				const Located = Locate(Call.path, Cwd);
				if (Located === undefined) {
					FactoryAppend(Context, State, "abstained foreign-workspace  0.00");
					return Downstream;
				}
				// THE FOLLOW-THROUGH (D8): this judged call either names one of
				// the open note's companions (an ACCEPT for that companion and
				// its family) or ages the window by one call; the call that
				// reaches the window closes the note as a soft REJECT.
				const Followed = State.Rings.Follow(Rings, Call.path);
				switch (true) {
					case Followed !== undefined && State.Learn: {
						State.Learning.Move(Followed.family, [Followed.companion], "accepted");
						State.Learning.Resolve(Followed.family, Followed.companions, "accepted");
						FactoryAppend(
							Context,
							State,
							`accepted ${Followed.family} ${Followed.companion}`,
						);
						break;
					}
					default:
						break;
				}
				const Closed = State.Rings.Age(Rings, State.LearnWindow);
				switch (true) {
					case Closed !== undefined && State.Learn: {
						State.Learning.Move(Closed.family, Closed.companions, "rejected");
						State.Learning.Resolve(Closed.family, Closed.companions, "rejected");
						FactoryAppend(
							Context,
							State,
							`rejected ${Closed.family} ${Closed.companions.length} companions`,
						);
						break;
					}
					default:
						break;
				}
				State.Rings.Touch(Rings, Call.path);
				// The base-aware existence filter: a companion absent from all
				// three bases is dropped before the score/gate step.
				const Detections = Filter(
					Detect(Families(Located.pack, "doc"), Call),
					Call.path,
					Located.root,
					Cwd,
				);
				const Winner = Detections[0];
				const FamilyId = Winner?.family.id ?? "";
				// The pickable decision model, resolved per call (the config cells
				// are volatile) plus the learned rates the score reads.
				const Table = Weights(State.Heuristics, State.Weights);
				const Input: MeasureInput = {
					weights: Table.weights,
					rate: (Path: string) => State.Learning.Rate(FamilyId, Path).Companion,
					familyRate: State.Learning.Rate(FamilyId, "").Family,
					exclude: State.Exclude,
					callPath: Call.path,
				};
				const Verdict: Verdict =
					Winner === undefined
						? { action: "abstain", reason: "no-signal", kappa: 0, candidates: [] }
						: Score(Detections, {
								Cooled: [...Rings.cooled.keys()],
								Noted: Rings.cooledNoted,
								Touched: Rings.touched,
								Notes: Rings.notes,
								MaxNotes: State.MaxNotesPerTurn,
								Threshold: State.Threshold,
								MaxCompanions: State.MaxCompanions,
								Measure: Input,
							});
				switch (Verdict.action) {
					case "emit": {
						const Paths = Verdict.candidates.map((Candidate) => Candidate.path);
						const Body = Text(
							FamilyId,
							Verdict.kappa,
							Verdict.candidates,
							State.MaxNoteChars,
						);
						const Note = BuildNote(Body, `${FamilyId} ${Verdict.kappa.toFixed(2)}`);
						State.Rings.Mark(Rings, FamilyId, NoteKey(FamilyId, Paths));
						// The decision record: every pickable value, the weights, the
						// enabled list and the `pending` outcome placeholder, stored
						// through the learned layer and logged in the ledger.
						switch (true) {
							case State.Learn: {
								State.Rings.Open(Rings, FamilyId, Paths);
								State.Last = Decide(
									State.Learning,
									FamilyId,
									Verdict.kappa,
									Verdict.candidates,
									Table,
								);
								FactoryAppend(Context, State, Decided(State.Last));
								break;
							}
							default:
								break;
						}
						FactoryAppend(
							Context,
							State,
							`suggest ${FamilyId} ${Verdict.kappa.toFixed(2)} ${Paths.length} companions ${Call.path}`,
						);
						return Attach(Downstream, Note);
					}
					case "suppress":
						FactoryAppend(Context, State, `suppressed ${Verdict.reason} ${FamilyId}`);
						break;
					default: {
						FactoryAppend(
							Context,
							State,
							`abstained ${Verdict.reason} ${FamilyId} ${Verdict.kappa.toFixed(2)}`,
						);
						// The gated silences worth learning from: the family matched
						// but the threshold held, or every companion was already
						// touched. The would-be companions are measured by the same
						// leaf the score uses, so the record is comparable.
						switch (true) {
							case State.Learn &&
								Winner !== undefined &&
								(Verdict.reason === "low-confidence" ||
									Verdict.reason === "already-touched"): {
								State.Last = Decide(
									State.Learning,
									FamilyId,
									Verdict.kappa,
									Would(Winner.family, Input, State.MaxCompanions),
									Table,
								);
								FactoryAppend(Context, State, Decided(State.Last));
								break;
							}
							default:
								break;
						}
						break;
					}
				}
				return Downstream;
			} catch (Error) {
				// Fail-open: never throw into the waterfall.
				try {
					Context.logger?.warn(
						`hook-dsh-doc-suggester: ${String(Error)}; the call passes through unnoted`,
					);
				} catch {
					/* logger optional */
				}
				return Downstream;
			}
		},
	);

	// ------------------------------------------------------------------
	// Listener 2: agent/pre-step - the per-turn reset.
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
			const Rings: RingState = State.Rings.State(Step.agent);
			if (
				Array.isArray(Step.messages) &&
				Step.messages.some((Entry) => Entry?.source?.kind === "user")
			) {
				State.Rings.Reset(Rings);
			}
		} catch (Error) {
			try {
				Context.logger?.warn(
					`hook-dsh-doc-suggester: ${String(Error)}; the reset is skipped`,
				);
			} catch {
				/* logger optional */
			}
		}
		return Downstream;
	});

	// The loader ignores any return value; the end-phase smoke probes the
	// built State through this debug attachment instead.
	(Context as { __hookDshDocSuggesterState?: State }).__hookDshDocSuggesterState = State;
};
