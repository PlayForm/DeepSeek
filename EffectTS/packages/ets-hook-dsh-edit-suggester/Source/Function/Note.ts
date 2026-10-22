// Note - the additionalContexts notice builder (the tool-coach and
// search-suggester precedent). Builds the labeled UserMessage the
// post-execute listener prepends to the downstream decision's
// additionalContexts.
//
// THE SOURCE LABEL IS LOAD-BEARING: an unlabeled context would render as a
// user prompt in derived history. The label is
// `{ kind: 'edit-suggester', form: 'notice', summary }` - the
// merge-extensible MessageSource vocabulary (this module declares the
// suggester's own kind in its own module), with the `notice` form's required
// one-line `summary` bound to the harness's 120-char limit.
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
		"edit-suggester": {
			readonly kind: "edit-suggester";
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
 * Build the note TEXT: one line of family and confidence, the capped
 * companion list with one reason each, and the standing caution.
 * @param Family - the family id.
 * @param Kappa - the confidence, two decimals.
 * @param Candidates - the scored companions (already capped).
 * @param Limit - the config's maxNoteChars.
 */
export const Text = (
	Family: string,
	Kappa: number,
	Candidates: { path: string; reason: string }[],
	Limit: number,
): string => {
	const Lines = [
		`[edit-suggester] family=${Family} confidence=${Kappa.toFixed(2)}`,
		`companions (${Candidates.length}):`,
	];
	for (const Candidate of Candidates) {
		Lines.push(`- ${Candidate.path} - ${Candidate.reason}`);
	}
	Lines.push("note: this file rarely stands alone; check whether these need the same change.");
	const Joined = Lines.join("\n");
	if (Joined.length <= Limit) {
		return Joined;
	}
	return `${Joined.slice(0, Limit - 1)}...`;
};

/**
 * Build one identified, frozen user-role notice message.
 * @param Body - the model-facing note text.
 * @param Summary - the one-line account (`<family> <kappa>`).
 */
export default (Body: string, Summary: string): UserMessage => {
	const Source: MessageSource = {
		kind: "edit-suggester",
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
