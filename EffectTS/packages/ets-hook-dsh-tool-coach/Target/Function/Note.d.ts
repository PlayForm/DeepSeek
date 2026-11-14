import type { UserMessage } from "@deepseek-ai/dsh-llm";
/**
 * @module Note
 *
 * The tier-1 additionalContexts notice builder: the labeled UserMessage the
 * post-execute listener prepends to the downstream decision's
 * additionalContexts.
 *
 * @remarks
 *
 * Plan Part 3 §3.5 step 5.
 *
 * THE SOURCE LABEL IS LOAD-BEARING (the repeat-tool-reminder precedent,
 * README:89): an unlabeled context would render as a user prompt in derived
 * history. The label is `{ kind: 'tool-coach', form: 'notice', summary }` -
 * the merge-extensible MessageSource vocabulary (this module declares the
 * coach's own kind in its own module, per the vocabulary's contract), with
 * the `notice` form's required one-line `summary` (`<tool> <class> ×
 * <count>`, bound to the harness's 120-char summary limit).
 *
 * The message factory mirrors the @deepseek-ai/dsh-llm `createUserMessage`
 * contract LOCALLY (identified, deep-frozen, random UUID) - the repeat-
 * tool-reminder bundles the same helper instead of importing it, so the
 * built Target carries no runtime import of the harness's own packages.
 */
declare module "@deepseek-ai/dsh-llm" {
    interface MessageSourceMap {
        "tool-coach": {
            readonly kind: "tool-coach";
            readonly form: "notice";
            readonly summary: string;
        };
    }
}
/**
 * Bind a notice summary to the harness's 120-char limit (ellipsized).
 */
export declare const BoundSummary: (Summary: string) => string;
export default _default;
/**
 * Build one identified, frozen user-role notice message.
 * @param Text - the model-facing note text.
 * @param Summary - the one-line account (`<tool> <class> × <count>`).
 */
declare function _default(Text: string, Summary: string): UserMessage;
/**
 * Prepend the coach's notice while preserving every downstream context's
 * source and metadata (the repeat-tool-reminder's prependContext).
 */
export declare const Prepend: (Ours: UserMessage, Theirs: readonly UserMessage[] | undefined) => UserMessage[];
