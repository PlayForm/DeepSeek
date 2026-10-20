// Note - the tier-1 additionalContexts notice builder (plan Part 3 §3.5
// step 5). Builds the labeled UserMessage the post-execute listener prepends
// to the downstream decision's additionalContexts.
//
// THE SOURCE LABEL IS LOAD-BEARING (the repeat-tool-reminder precedent,
// README:89): an unlabeled context would render as a user prompt in derived
// history. The label is `{ kind: 'tool-coach', form: 'notice', summary }` -
// the merge-extensible MessageSource vocabulary (this module declares the
// coach's own kind in its own module, per the vocabulary's contract), with
// the `notice` form's required one-line `summary` (`<tool> <class> ×
// <count>`, bound to the harness's 120-char summary limit).
//
// The message factory mirrors the @deepseek-ai/dsh-llm `createUserMessage`
// contract LOCALLY (identified, deep-frozen, random UUID) - the repeat-
// tool-reminder bundles the same helper instead of importing it, so the
// built Target carries no runtime import of the harness's own packages.
import { randomUUID } from "node:crypto";

import type { MessageSource, UserMessage } from "@deepseek-ai/dsh-llm";

// The coach's own source kind, declared in the coach's own module (the
// MessageSourceMap vocabulary is merge-extensible by design).
declare module "@deepseek-ai/dsh-llm" {
	interface MessageSourceMap {
		"tool-coach": {
			readonly kind: "tool-coach";
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
	return `${Summary.slice(0, SUMMARY_MAX - 1)}…`;
};

/**
 * Build one identified, frozen user-role notice message.
 * @param Text - the model-facing note text.
 * @param Summary - the one-line account (`<tool> <class> × <count>`).
 */
export default (Text: string, Summary: string): UserMessage => {
	const Source: MessageSource = {
		kind: "tool-coach",
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
 * Prepend the coach's notice while preserving every downstream context's
 * source and metadata (the repeat-tool-reminder's prependContext).
 */
export const Prepend = (
	Ours: UserMessage,
	Theirs: readonly UserMessage[] | undefined,
): UserMessage[] => [Ours, ...(Theirs ?? [])];
