// Note - the additionalContexts notice builder (the plan's delivery surface,
// SEARCH-SUGGESTER-PLUGIN.md §4.6 surface 1; the tool-coach precedent).
// Builds the labeled UserMessage the post-execute listener prepends to the
// downstream decision's additionalContexts.
//
// THE SOURCE LABEL IS LOAD-BEARING (the tool-coach precedent): an unlabeled
// context would render as a user prompt in derived history. The label is
// `{ kind: 'convention-suggester', form: 'notice', summary }` - the
// merge-extensible MessageSource vocabulary (this module declares the
// suggester's own kind in its own module, per the vocabulary's contract),
// with the `notice` form's required one-line `summary` (`<Intent> <k>`,
// bound to the harness's 120-char summary limit).
//
// The message factory mirrors the @deepseek-ai/dsh-llm `createUserMessage`
// contract LOCALLY (identified, deep-frozen, random UUID) - the hook bundles
// the same helper instead of importing it, so the built Target carries no
// runtime import of the harness's own packages.
import { randomUUID } from "node:crypto";

import type { MessageSource, UserMessage } from "@deepseek-ai/dsh-llm";

// The suggester's own source kind, declared in its own module (the
// MessageSourceMap vocabulary is merge-extensible by design).
declare module "@deepseek-ai/dsh-llm" {
	interface MessageSourceMap {
		"convention-suggester": {
			readonly kind: "convention-suggester";
			readonly form: "notice";
			readonly summary: string;
		};
	}
}

/** The harness's bound for a notice summary (dsh-llm CONTEXT_SUMMARY_MAX_CHARS). */
const SUMMARY_MAX = 120;

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
	if (Summary.length <= SUMMARY_MAX) {
		return Summary;
	}
	return `${Summary.slice(0, SUMMARY_MAX - 1)}...`;
};

/**
 * Build one identified, frozen user-role notice message.
 * @param Text - the model-facing note text.
 * @param Summary - the one-line account (`<Intent> <k>`).
 */
export default (Text: string, Summary: string): UserMessage => {
	const Source: MessageSource = {
		kind: "convention-suggester",
		form: "notice",
		summary: BoundSummary(Summary),
	};
	return DeepFreeze({
		id: randomUUID() as UserMessage["id"],
		role: "user",
		content: [{ type: "text", text: Text }],
		source: Source,
	});
};

/**
 * Prepend the suggester's notice while preserving every downstream context's
 * source and metadata (the tool-coach's Prepend).
 */
export const Prepend = (
	Ours: UserMessage,
	Theirs: readonly UserMessage[] | undefined,
): UserMessage[] => [Ours, ...(Theirs ?? [])];
