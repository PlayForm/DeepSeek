// Apply - the plugin entry function: the State build (the factory's cell
// unwrap + the volatile refresh), the durable activation proof, and the TWO
// listeners of the doc suggester's surfaces:
//
//   1. tools/post-execute (waterfall, plain registration): next() first,
//      then the doc path the call names, Detect, Score's gate, and ONE
//      additionalContexts note naming the doc-graph companions not yet
//      touched - never a content replacement;
//   2. agent/pre-step (plain): the per-turn reset when a user message
//      enters.
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
// NOT factory machinery, deliberately: no fs/observed Wire, no Attach, no
// factory Schema - the suggester owns its schema (Variable/Config) and its
// strings. The function returns NOTHING; test probes (the end-phase) read
// the state through the `ctx.__hookDshDocSuggesterState` attachment.
import type { Context } from "@deepseek-ai/cordis";
import type { UserMessage } from "@deepseek-ai/dsh-llm";
import type { PostToolDecision, ToolExecution, ToolExecutionResult } from "@deepseek-ai/dsh-tools";
import { Activate } from "@playform/ets-base-dsh";

import type Config from "../Interface/Config.js";
import type { DocView, Verdict } from "../Interface/Execution.js";
import type State from "../Interface/State.js";
import Detect from "./Detect.js";
import BuildNote, { Prepend, Text } from "./Note.js";
import Pack from "./Pack.js";
import Ring, { type RingState } from "./Ring.js";
import Score, { NoteKey } from "./Score.js";

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
	// listener - a flip (threshold, cooldownCalls, ...) lands on the next
	// judged call without a remount.
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
		},
	});
	State.Factory = Factory;
	State.Pack = Pack;
	State.Rings = Ring();

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
	// Listener 1: tools/post-execute - the doc-graph companions note.
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
				State.Rings.Touch(Rings, Call.path);
				const Detections = Detect(State.Pack, Call);
				const Verdict: Verdict =
					Detections.length === 0
						? { action: "abstain", reason: "no-signal", kappa: 0, candidates: [] }
						: Score(Detections, Call.path, {
								Cooled: [...Rings.cooled.keys()],
								Noted: Rings.cooledNoted,
								Touched: Rings.touched,
								Notes: Rings.notes,
								MaxNotes: State.MaxNotesPerTurn,
								Threshold: State.Threshold,
								MaxCompanions: State.MaxCompanions,
								Exclude: State.Exclude,
							});
				const FamilyId = Detections[0]?.family.id ?? "";
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
					default:
						FactoryAppend(
							Context,
							State,
							`abstained ${Verdict.reason} ${FamilyId} ${Verdict.kappa.toFixed(2)}`,
						);
						break;
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
