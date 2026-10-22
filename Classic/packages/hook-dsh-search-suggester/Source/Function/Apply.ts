// Apply - the plugin entry function: the State build (the factory's cell
// unwrap + the volatile refresh), the durable activation proof, the knowledge
// load, and the FOUR listeners of the suggester's surfaces (plan section
// 4.2):
//
//   1. tools/post-execute (waterfall, plain registration - AFTER the ccr's
//      {prepend:true} listener and the normalize family, since plain
//      registration order guarantees it): next() first, then the call view,
//      Detect, Score's gate, and ONE additionalContexts note prepended to the
//      downstream decision - never a content replacement;
//   2. agent/pre-step (plain): the per-turn reset (the ring, the cooldown
//      counters, the dedupe set) when a user message enters, plus the user
//      text capture for the R12 context bonus;
//   3. system-prompt/assemble (waterfall, after next()): the optional sticky
//      section (config sectionMode "sticky"), TTL-rebuilt;
//   4. tools/change (emit): the sticky section-cache invalidation only.
//
// THE WATERFALL DISCIPLINE: `next()` is ALWAYS awaited first; pass-through
// returns the downstream decision unchanged; FAIL-OPEN: every listener body
// is one try/catch - on any error a logger.warn records it and the
// downstream decision is returned UNCHANGED. A note never fails a waterfall.
//
// THE NOTE NEVER TOUCHES CONTENT: it is a separate message, so it survives
// the ccr and cannot be mistaken for file content (plan section 4.6). The
// learning signals (write/edit/raw-write) are observed for the follow/ignore
// rules (plan 6.2), never noted - a note after the edit is too late (plan
// section 3.3).
//
// NOT factory machinery, deliberately: no fs/observed Wire, no Attach, no
// factory Schema - the suggester owns its schema (Variable/Config) and its
// strings. The function returns NOTHING; test probes (the end-phase) read
// the state through the `ctx.__hookDshSearchSuggesterState` attachment.
import type { Context } from "@deepseek-ai/cordis";
import type { UserMessage } from "@deepseek-ai/dsh-llm";
import type { AssembleContext, PromptAssembly } from "@deepseek-ai/dsh-system-prompt";
import type { PostToolDecision, ToolExecution, ToolExecutionResult } from "@deepseek-ai/dsh-tools";
import { Activate } from "@playform/lib-dsh-core";

import type Config from "../Interface/Config.js";
import type { CallView, Verdict } from "../Interface/Execution.js";
import type State from "../Interface/State.js";
import Detect from "./Detect.js";
import BuildNote, { Prepend, Text } from "./Note.js";
import Pack from "./Pack.js";
import Load, { Emitted, Followed, Ignored, Row, Save } from "./Persist.js";
import Ring, { type RingState } from "./Ring.js";
import Score, { NoteKey } from "./Score.js";

// The bundle version, mirrored from package.json (the activation proof's
// first field; a release bumps both together).
const Version = "0.1.0";

/** The learning-only tools: observed for the follow/ignore rules, never noted. */
const Learning = ["write", "edit", "raw-write"];

/** The call view of one judged call (plan section 3.3): the classified text. */
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

/** The user text of the step: the last user message's text content, lowercased. */
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

/** The enabled pack, filtered to the config's intent kinds (order kept). */
const Enabled = (State: State) => State.Pack.filter((Intent) => State.Intents.includes(Intent.id));

/** The learning verdict for an open note whose window has closed untouched (plan 6.2). */
const LearnTail = (Context: Context, State: State, Rings: RingState): void => {
	if (!State.Learn || Rings.pending === undefined) {
		return;
	}
	if (Rings.pending.since >= State.LearnWindow) {
		Ignored(State.Knowledge, Rings.pending.intent);
		FactoryAppend(Context, State, `ignored ${Rings.pending.intent}`);
		Save(State.Knowledge, State.PersistPath);
		Rings.pending = undefined;
	}
};

/** The ledger append helper (the factory's Append, with the state bound). */
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
			SectionMode: "sectionMode",
			SectionTtl: "sectionTtl",
		},
	});
	State.Factory = Factory;
	State.Pack = Pack;
	State.Knowledge = Load(State.PersistPath);
	State.Rings = Ring();

	// Durable activation proof - "did it activate" must be answerable from the
	// ledger alone. Format (plan section 4.9):
	//   search-suggester: activated (bundle 0.1.0, intents 10, threshold 0.75)
	if (!State.On) {
		Factory.Append(State, "disabled (enabled=false)");
	} else {
		Factory.Append(
			State,
			Activate([
				["", `bundle ${Version}`],
				["", `intents ${Enabled(State).length}`],
				["", `threshold ${State.Threshold}`],
			]),
		);
	}

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
						const Hit = Object.keys(State.Knowledge.intents[Intent] ?? {}).find(
							(Path) =>
								EditPath === Path ||
								EditPath.endsWith(Path.replace(/\*$/, "")) ||
								(Path.includes("*") &&
									EditPath.match(new RegExp(Path.replace(/\*/g, "[^/]+"))) !==
										null),
						);
						if (Hit !== undefined) {
							Followed(State.Knowledge, Intent, Hit, Math.floor(Date.now() / 1000));
							FactoryAppend(Context, State, `followed ${Intent} ${Hit}`);
							Save(State.Knowledge, State.PersistPath);
							Rings.pending = undefined;
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
				// The open note's learning tail, then the cooldown aging.
				LearnTail(Context, State, Rings);
				State.Rings.Tick(Rings, State.CooldownCalls);
				if (Rings.pending !== undefined) {
					Rings.pending.since += 1;
				}
				const Call = View(Exec);
				const Detections = Detect(
					Enabled(State),
					Call,
					State.Rings.Intents(Rings),
					Rings.userText,
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
	// sectionMode "sticky"): the most recent intent's target list, rebuilt on
	// a TTL (plan 4.6, second surface). Off by default.
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
				const Intent =
					Recent.length === 0
						? undefined
						: State.Pack.find((Row2) => Row2.id === Recent[Recent.length - 1]);
				if (Intent === undefined) {
					return Downstream;
				}
				const Stale =
					Rings.sectionBuilt === undefined ||
					Rings.calls - Rings.sectionBuilt >= State.SectionTtl;
				if (Stale) {
					Rings.sectionText = Text(
						Intent.id,
						1,
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
	// Listener 4: tools/change - the sticky section-cache invalidation only
	// (the section cache lives on the per-agent rings; the default ring's
	// cache is cleared here, every other ring expires through the TTL).
	// ------------------------------------------------------------------
	Context.on("tools/change", (): void => {
		try {
			if (!State.On) {
				return;
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

	// The loader ignores any return value; the end-phase smoke probes the
	// built State through this debug attachment instead.
	(Context as { __hookDshSearchSuggesterState?: State }).__hookDshSearchSuggesterState = State;
};
