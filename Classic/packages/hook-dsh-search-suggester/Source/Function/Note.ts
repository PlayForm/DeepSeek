// Note - the additionalContexts notice builder (the tool-coach precedent,
// plan section 4.6). Builds the labeled UserMessage the post-execute listener
// prepends to the downstream decision's additionalContexts.
//
// THE SOURCE LABEL IS LOAD-BEARING: an unlabeled context would render as a
// user prompt in derived history. The label is
// `{ kind: 'search-suggester', form: 'notice', summary }` - the
// merge-extensible MessageSource vocabulary (this module declares the
// suggester's own kind in its own module), with the `notice` form's required
// one-line `summary` (`<intent> <kappa>`, bound to the harness's 120-char
// summary limit).
//
// The message factory mirrors the @deepseek-ai/dsh-llm `createUserMessage`
// contract LOCALLY (identified, deep-frozen, random UUID) - the suggester
// bundles the same helper instead of importing it, so the built Target
// carries no runtime import of the harness's own packages.
import { randomUUID } from "node:crypto";

import type { MessageSource, UserMessage } from "@deepseek-ai/dsh-llm";

// The suggester's own source kind, declared in the suggester's own module
// (the MessageSourceMap vocabulary is merge-extensible by design).
declare module "@deepseek-ai/dsh-llm" {
	interface MessageSourceMap {
		"search-suggester": {
			readonly kind: "search-suggester";
			readonly form: "notice";
			readonly summary: string;
		};
	}
}

/** The harness's bound for a notice summary (dsh-llm CONTEXT_SUMMARY_MAX_CHARS). */
const SummaryMax = 120;

/** Deep-freeze a value in place (the dsh-llm message contract). */
const DeepFreeze = <T>(Value: T): T => {
	if (Value && typeof Value === "object") {
		for (const Key of Object.keys(Value as object)) {
			DeepFreeze((Value as Record<string, unknown>)[Key]);
		}
		Object.freeze(Value);
	}
	return Value;
};

/** Bind a notice summary to the harness's 120-char limit (ellipsized). */
export const BoundSummary = (Summary: string): string => {
	if (Summary.length <= SummaryMax) {
		return Summary;
	}
	return `${Summary.slice(0, SummaryMax - 1)}...`;
};

/**
 * Build the note TEXT (plan section 7): one line of intent, the capped
 * candidate list with one reason each, and the standing cautions.
 * @param Intent - the intent id.
 * @param Kappa - the confidence, two decimals.
 * @param Candidates - the scored candidates (already capped).
 * @param Limit - the config's maxNoteChars.
 */
export const Text = (
	Intent: string,
	Kappa: number,
	Candidates: { path: string; reason: string; count?: number }[],
	Limit: number,
): string => {
	const Lines = [
		`[search-suggester] intent=${Intent} confidence=${Kappa.toFixed(2)}`,
		`targets (${Candidates.length}):`,
	];
	for (const Candidate of Candidates) {
		Lines.push(
			`- ${Candidate.path}${Candidate.count === undefined ? "" : ` (${Candidate.count})`} - ${Candidate.reason}`,
		);
	}
	Lines.push("note: open these before more searches; Target/ is generated, never edit it.");
	const Joined = Lines.join("\n");
	if (Joined.length <= Limit) {
		return Joined;
	}
	return `${Joined.slice(0, Limit - 1)}...`;
};

/**
 * Build one identified, frozen user-role notice message.
 * @param Body - the model-facing note text.
 * @param Summary - the one-line account (`<intent> <kappa>`).
 */
export default (Body: string, Summary: string): UserMessage => {
	const Source: MessageSource = {
		kind: "search-suggester",
		form: "notice",
		summary: BoundSummary(Summary),
	};
	return DeepFreeze({
		id: randomUUID() as UserMessage["id"],
		role: "user",
		content: [{ type: "text", text: Body }],
		source: Source,
	});
};

/**
 * Prepend the suggester's notice while preserving every downstream context's
 * source and metadata (the tool-coach's prependContext).
 */
export const Prepend = (
	Ours: UserMessage,
	Theirs: readonly UserMessage[] | undefined,
): UserMessage[] => [Ours, ...(Theirs ?? [])];
