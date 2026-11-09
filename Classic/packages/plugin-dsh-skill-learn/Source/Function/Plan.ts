/**
 * @module Plan
 *
 * The phase-1 request: one hand-built `ctx.llm.stream` call carrying the digest and the
 * skill index, and the `text-delta` read that collects its reply.
 *
 * @remarks
 * THE REQUEST CARRIES EXACTLY SIX FIELDS (plan section 4.1): `system` is `Prompt(1)`,
 * `messages` is one user message built here, `provider` and `model` are the resolved
 * route, `maxTokens` is the reply budget, and `signal` is the maintenance signal.
 * `purpose` IS DELIBERATELY UNSET: its union is closed to `'compaction'` and
 * `'session-title'` (`dsh-llm/lib/types/types.d.ts:547`), and a review has no slot in
 * it, so a review that set one would be claiming to be a call it is not.
 *
 * THE CALL IS NOT AN AGENT-LOOP REQUEST. The loop marks its own request objects in a
 * process-local WeakSet (`dsh-llm/lib/index.js:377`, `:386`); a hand-built object is
 * simply never added, so no adapter or interceptor can mistake this for a turn
 * (`Temporary/Research/DSH-Skill-Surface.md:204`). That is why there is no `tools`
 * field and no loop: two calls maximum, no repair pass, no iteration (plan section
 * 4.2).
 *
 * THE REPLY IS READ FROM `text-delta` FRAMES ONLY
 * (`dsh-llm/lib/types/types.d.ts:439-442`, the pattern at
 * `Classic/packages/plugin-dsh-lesson-review/Source/Library.ts:302-311`). Reasoning
 * deltas, tool-call deltas, usage frames and the finish frame are all skipped: the
 * reply is a JSON object, so anything that is not visible text cannot be part of it,
 * and collecting reasoning would silently prepend prose the strict parser must then
 * reject.
 *
 * A THROW IS LEFT TO THE CALLER. The stream can reject (no adapter, a transport
 * failure, an aborted signal); the service turns that into `model-failed` with the
 * error's message, because the ledger line and the report both need the cause and this
 * leaf has nowhere to put it.
 */
import type { Route } from "@Function/Route.js";
import type { LlmSlice } from "@Interface/Services.js";

/** One phase-1 call: the route, the system prompt, the user text's parts, and the run's limits. */
export interface PlanOptions {
	readonly route: Route;

	/** `Prompt(1)`, the byte-stable phase-1 text. */
	readonly system: string;

	/** The digest text (`Function/Digest`). */
	readonly digest: string;

	/** The catalog index lines (`Function/Catalog`). */
	readonly index: readonly string[];
	readonly maxTokens: number;
	readonly signal: AbortSignal;
}

/** The phase marker the user message ends with, so the request states which reply it wants. */
const Marker = "Phase 1 of 2: return the plan. Reply with one JSON object and nothing else.";

/** The index section, with a stated fallback so an empty catalog is not a blank gap. */
const Index = (Lines: ReadonlyArray<string>): string =>
	Lines.length === 0
		? "Skill index: (the catalog is empty)"
		: ["Skill index:", ...Lines].join("\n");

export default async (Llm: LlmSlice, Options: PlanOptions): Promise<string> => {
	// The digest, then the index, then the phase marker, as one user message
	// (plan section 4.1). An empty part is dropped rather than sent as a blank line.
	const User = [Options.digest, Index(Options.index), Marker]
		.filter((Part) => Part !== "")
		.join("\n\n");
	let Reply = "";
	const Stream = Llm.stream({
		provider: Options.route.provider,
		model: Options.route.model,
		system: Options.system,
		messages: [{ role: "user", content: [{ type: "text", text: User }] }],
		maxTokens: Options.maxTokens,
		signal: Options.signal,
	});
	for await (const Frame of Stream) {
		// Every other frame is skipped: reasoning, tool calls, usage, and the finish.
		if (Frame.type === "text-delta" && typeof Frame.text === "string") Reply += Frame.text;
	}
	return Reply;
};
