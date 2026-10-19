// Overpass - the TOOL-RESULTS arm of the post-hoc normalization (the plan's
// §4.1): one tools/post-execute waterfall listener per flavor, registered in
// Function/Apply next to the llm/stream listener. The principle (R2 §5):
// overpass normalizes only what re-enters the model or lands in a file - a
// tool result here is PRE-COMMIT (the waterfall settles before the result is
// appended to the durable log), so rewriting it is not history rewriting.
//
// Semantics (each decision point follows the ccr precedent,
// hook-dsh-ccr/Source/Function/Apply.ts:201-218):
//   * next() is ALWAYS awaited first - omitting it short-circuits the
//     downstream listeners;
//   * the scope gate (`State.Scopes.toolResults`, refreshed in place by the
//     factory's P10 volatile-update listener): off -> the downstream decision
//     passes through UNTOUCHED (the default - the arm is opt-in);
//   * the exemption list (`State.Exempt` - config `toolResultsExempt`): a
//     result whose exec name is listed passes through by identity (read/edit
//     are byte-contracted, raw-write/normalize-file own their normalization,
//     ccr_retrieve's bytes are the retrieval contract, subagent/
//     ask_user_question carry prompt material matched verbatim);
//   * only an accepted, non-value-carrying decision can be replaced
//     (`Object.hasOwn(Decision, "value")` - a value-carrying decision is
//     canonical; its content is a derived projection);
//   * the content basis is `Decision.content ?? Result.content` - what the
//     downstream listeners already shaped, or the raw result;
//   * TEXT blocks only: never tool-call/argument blocks (the execution-
//     critical-JSON rule of the core's stream gate);
//   * the CCR MARKER GUARD: a text block already carrying the ccr spill
//     marker bytes passes through untouched - normalization never touches a
//     ccr replacement, which makes the arm order-safe against the ccr hook's
//     own prepended post-execute listener under ANY bundle load order;
//   * N = 0 -> the downstream decision is returned unchanged (no ledger
//     line - the normalize-file no-op precedent);
//   * N > 0 -> `{ ...Decision, content: <rewritten blocks> }` and the
//     ledger line `overpass: normalized N char(s) in tool result <toolName>
//     <callId>` via Factory.Append, plus the shared `normalized` journal
//     event with the scope in the path slot;
//   * FAIL-OPEN: the whole arm is one try/catch - on any error the
//     downstream decision is returned UNCHANGED. Never throw into the
//     waterfall: a thrown listener would turn a good tool result into a
//     pipeline failure.
//
// The registration is `{ prepend: true }`: the family's bundle order places
// the ccr hook before the normalize hooks, so the arm that prepends later is
// OUTERMOST - the ccr gate compresses the NORMALIZED bytes (its size stats
// then describe what the model actually sees). The marker guard above makes
// any load order safe regardless.
//
// The FLAVOR: the flavor transform - its own Replace delegate pinned to the
// configured replacement (read from State at call time, so a volatile
// hot-edit takes effect on the next dispatch exactly like the stream arm).
//
// Pure per call: no module-level state - two concurrent dispatches share
// nothing, and an HMR reload rebinds the closure cleanly.
import type { ContentBlock } from "@deepseek-ai/dsh-llm";
import type { PostToolDecision, ToolExecution, ToolExecutionResult } from "@deepseek-ai/dsh-tools";
import Replace from "./Replace.js";
import type State from "@Interface/State.js";

/** The schema-default scopes (the fallback for a hand-built config). */
export const DefaultScopes = {
	conversation: true,
	reasoning: true,
	toolInput: false,
	toolResults: false,
	files: true,
	batch: false,
};

/** The schema-default exemption list (the fallback for a hand-built config). */
export const DefaultExempt = [
	"read",
	"edit",
	"raw-write",
	"normalize-file",
	"ccr_retrieve",
	"subagent",
	"ask_user_question",
];

/** The ccr spill marker's opening bytes - content carrying them is a ccr
 *  replacement and passes through untouched (the order-safety guard). */
export const CcrMarker = "<<<CCR:";

/** A structural content block: the only field the arm reads is the text. */
export type Block = { type?: unknown; text?: unknown };

/** Rewrite the TEXT blocks of one content array through the given transform.
 *  Returns a copy with the text blocks rewritten, or the ORIGINAL array by
 *  identity when nothing changed (the N = 0 no-op rule). `Count` accumulates
 *  the replaced characters. */
export const RewriteBlocks = (
	Content: readonly Block[],
	Transform: (Text: string) => { text: string; count: number },
	Count: { value: number },
): Block[] => {
	let Changed = false;
	const Next = Content.map((Block) => {
		switch (true) {
			case Block?.type !== "text" || typeof Block?.text !== "string":
				return Block; // never tool-call/argument or unknown blocks
			case String(Block.text).includes(CcrMarker):
				return Block; // the ccr marker guard
		}
		const Result = Transform(Block.text as string);
		switch (true) {
			case Result.count === 0:
				return Block;
		}
		Changed = true;
		Count.value += Result.count;
		return { ...Block, text: Result.text };
	});
	// Unchanged -> the ORIGINAL array by identity (the caller's
	// identity-preservation checks rely on this).
	return Changed ? Next : (Content as Block[]);
};

/** The tools/post-execute arm (the listener body; Function/Apply registers
 *  it with `{ prepend: true }`). */
export default async (
	Exec: ToolExecution,
	Result: ToolExecutionResult,
	Next: () => Promise<PostToolDecision>,
	State: State,
): Promise<PostToolDecision> => {
	// next() FIRST: the downstream listeners settle before any decision.
	const Decision = await Next();
	try {
		// The scope gate: off -> the downstream decision passes untouched.
		const Scopes = State.Scopes ?? DefaultScopes;
		switch (true) {
			case !Scopes.toolResults:
				return Decision;
		}
		// The exemption list: a listed exec name passes by identity.
		const Exempt = State.Exempt ?? DefaultExempt;
		switch (true) {
			case typeof Exec?.name === "string" && Exempt.includes(Exec.name):
				return Decision;
		}
		// Only an accepted, non-value-carrying decision can be replaced.
		switch (true) {
			case Decision.kind !== "accept":
			case Object.hasOwn(Decision, "value"):
				return Decision;
		}
		// The content basis: what downstream shaped, or the raw result.
		const Content = Decision.content ?? Result.content;
		if (!Array.isArray(Content)) {
			return Decision;
		}
		const Count = { value: 0 };
		const Rewritten = RewriteBlocks(
			Content,
			// The FLAVOR: the quotes transform pinned to the configured
			// replacement, read per dispatch from the (volatile-refreshed)
			// State.
			(Text) => Replace(Text),
			Count,
		);
		switch (true) {
			// N = 0 -> the downstream decision unchanged (no ledger line).
			case Count.value === 0:
				return Decision;
		}
		const Name = typeof Exec?.name === "string" ? Exec.name : "";
		const CallId = typeof Exec?.callId === "string" ? Exec.callId : "";
		const Line = `overpass: normalized ${Count.value} char(s) in tool result ${Name} ${CallId}`;
		State.Factory.Append(State, Line);
		// P5 journal - the shared `normalized` event with the scope in the
		// path slot, best-effort (with no storage facility this is a no-op).
		State.Factory.Journal(State, "normalized", `tool result ${Name} ${CallId}`, Line);
		// The replacement: `{ kind: "accept", content: <rewritten blocks> }`
		// (the plan's exact decision shape; the value case was excluded
		// above). The blocks are guarded casts: the rewrite only replaces the
		// `text` field of text blocks and spreads the rest verbatim, so the
		// structural copy preserves each block's full shape.
		return {
			kind: "accept",
			content: Rewritten as ContentBlock[],
		};
	} catch {
		// Fail-open: keep the downstream decision, never throw into the
		// waterfall (a thrown listener would fail the tool result).
		return Decision;
	}
};
