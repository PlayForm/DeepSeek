import type { UserMessage } from "@deepseek-ai/dsh-llm";
/**
 * @module Note
 *
 * The additionalContexts notice builder (the tool-coach precedent, plan
 * section 4.6). Builds the labeled UserMessage the post-execute listener
 * prepends to the downstream decision's additionalContexts.
 *
 * @remarks
 *
 * THE SOURCE LABEL IS LOAD-BEARING: an unlabeled context would render as a
 * user prompt in derived history. The label is
 * `{ kind: 'search-suggester', form: 'notice', summary }` - the
 * merge-extensible MessageSource vocabulary (this module declares the
 * suggester's own kind in its own module), with the `notice` form's required
 * one-line `summary` (`<intent> <kappa>`, bound to the harness's 120-char
 * summary limit).
 *
 * The message factory mirrors the @deepseek-ai/dsh-llm `createUserMessage`
 * contract LOCALLY (identified, deep-frozen, random UUID) - the suggester
 * bundles the same helper instead of importing it, so the built Target
 * carries no runtime import of the harness's own packages.
 */
/**
 * The suggester's own source kind, declared in the suggester's own module
 * (the MessageSourceMap vocabulary is merge-extensible by design).
 */
declare module "@deepseek-ai/dsh-llm" {
    interface MessageSourceMap {
        "search-suggester": {
            readonly kind: "search-suggester";
            readonly form: "notice";
            readonly summary: string;
        };
    }
}
/**
 * Bind a notice summary to the harness's 120-char limit (ellipsized).
 */
export declare const BoundSummary: (Summary: string) => string;
/**
 * Build the note TEXT (plan section 7): one line of intent, the capped
 * candidate list with one reason each, and the standing cautions.
 * @param Intent - the intent id.
 * @param Kappa - the confidence, two decimals.
 * @param Candidates - the scored candidates (already capped).
 * @param Limit - the config's maxNoteChars.
 */
export declare const Text: (Intent: string, Kappa: number, Candidates: {
    path: string;
    reason: string;
    count?: number;
}[], Limit: number) => string;
export default _default;
/**
 * Build one identified, frozen user-role notice message.
 * @param Body - the model-facing note text.
 * @param Summary - the one-line account (`<intent> <kappa>`).
 */
declare function _default(Body: string, Summary: string): UserMessage;
/**
 * Prepend the suggester's notice while preserving every downstream context's
 * source and metadata (the tool-coach's prependContext).
 */
export declare const Prepend: (Ours: UserMessage, Theirs: readonly UserMessage[] | undefined) => UserMessage[];
