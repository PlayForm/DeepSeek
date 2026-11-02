// Confirm - the phase-2 request: the same call shape as phase 1, carrying the
// exact bodies the plan asked to see, so a patch can only target text the model
// was handed.
//
// THIS FILE IS THE READ-BEFORE-WRITE PROPERTY, not a second prompt. The view set
// is computed by the caller as the plan's `views` unioned with every patch and
// support target (plan section 4.2), so a body the model did not name is still
// carried when an operation targets it, and the judge's `body-carried` rule can
// then require the anchor to occur in text the model actually saw. A confirm
// call that carried a body the model did not ask for, or that omitted one it
// did, would break the identity the whole fence rests on.
//
// THE BODIES ARE THE EXACT CURRENT TEXT: `ctx.skills.get(name).content` for a
// `SKILL.md`, `ctx.fs.readText` for a support file (plan section 4.2). Nothing
// here re-wraps, trims, or normalises them, because the model copies `oldString`
// out of this text character for character and the fence later matches that
// anchor against the file.
//
// THE FENCE LENGTH IS COMPUTED, because a `SKILL.md` may itself contain a
// triple-backtick code fence - a skill about a build pipeline almost certainly
// does. A fixed three-backtick delimiter would close early and hand the model a
// truncated body, which is exactly the failure the read-before-write property
// exists to prevent; so the delimiter is one backtick longer than the longest run
// the body contains, and never shorter than three.
//
// WHY THE REQUEST AND THE `text-delta` READ ARE REPEATED FROM `Function/Plan`:
// the two phases are two requests with one shape (plan section 4.1 and 4.2), and
// each leaf owns its own request so a change to one phase cannot silently change
// the other. The read is the same four lines by necessity - a reply is read from
// `text-delta` frames only (`dsh-llm/lib/types/types.d.ts:439-442`).
import type { Route } from "@Function/Route.js";
import type { LlmSlice } from "@Interface/Services.js";

/** One body the model asked to see: the skill's name and its exact current text. */
export interface View {
	readonly name: string;
	readonly body: string;
}

/** One phase-2 call: the route, the system prompt, the user text's parts, and the run's limits. */
export interface ConfirmOptions {
	readonly route: Route;
	/** `Prompt(2)`, the byte-stable phase-2 text. */
	readonly system: string;
	/** The digest text (`Function/Digest`). */
	readonly digest: string;
	/** The catalog index lines (`Function/Catalog`). */
	readonly index: readonly string[];
	/** The bodies the plan asked for, in the order the caller loaded them. */
	readonly views: readonly View[];
	readonly maxTokens: number;
	readonly signal: AbortSignal;
}

/** The phase marker the user message ends with, so the request states which reply it wants. */
const Marker =
	"Phase 2 of 2: return the final list. The bodies above are the current text. Reply with one JSON object and nothing else.";

/** The index section, with a stated fallback so an empty catalog is not a blank gap. */
const Index = (Lines: ReadonlyArray<string>): string =>
	Lines.length === 0
		? "Skill index: (the catalog is empty)"
		: ["Skill index:", ...Lines].join("\n");

/** A delimiter no backtick run in the body can close. */
const Fence = (Body: string): string => {
	const Runs: readonly string[] = Body.match(/`+/g) ?? [];
	const Widest = Runs.reduce((Widest, Run) => Math.max(Widest, Run.length), 0);
	return "`".repeat(Math.max(3, Widest + 1));
};

/** One body, fenced and labelled, so the model knows which skill it is reading. */
const Render = (View: View): string => {
	const Delimiter = Fence(View.body);
	return [`File: ${View.name}`, Delimiter, View.body, Delimiter].join("\n");
};

export default async (Llm: LlmSlice, Options: ConfirmOptions): Promise<string> => {
	const User = [
		Options.digest,
		Index(Options.index),
		Options.views.map(Render).join("\n\n"),
		Marker,
	]
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
