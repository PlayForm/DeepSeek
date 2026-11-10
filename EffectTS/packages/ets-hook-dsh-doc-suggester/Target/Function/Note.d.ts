import type { UserMessage } from "@deepseek-ai/dsh-llm";
/**
 * @module Note
 *
 * The additionalContexts notice builder (the tool-coach and
 * suggester-family precedent): it builds the labeled UserMessage the
 * post-execute listener prepends to the downstream decision's
 * additionalContexts.
 *
 * @remarks
 *
 * THE SOURCE LABEL IS LOAD-BEARING: an unlabeled context would render as a
 * user prompt in derived history. The label is
 * `{ kind: 'doc-suggester', form: 'notice', summary }` - the
 * merge-extensible MessageSource vocabulary (this module declares the
 * suggester's own kind in its own module), with the `notice` form's required
 * one-line `summary` bound to the harness's 120-char limit.
 *
 * The message factory mirrors the @deepseek-ai/dsh-llm `createUserMessage`
 * contract LOCALLY (identified, deep-frozen, random UUID) - the suggester
 * bundles the same helper instead of importing it, so the built Target
 * carries no runtime import of the harness's own packages.
 */
declare module "@deepseek-ai/dsh-llm" {
    interface MessageSourceMap {
        "doc-suggester": {
            readonly kind: "doc-suggester";
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
 * Build the note TEXT: one line of family and confidence, the capped
 * companion list with one reason each, and the standing caution.
 * @param Family - the family id.
 * @param Kappa - the confidence, two decimals.
 * @param Candidates - the scored companions (already capped).
 * @param Limit - the config's maxNoteChars.
 */
export declare const Text: (Family: string, Kappa: number, Candidates: {
    path: string;
    reason: string;
}[], Limit: number) => string;
export default _default;
/**
 * Build one identified, frozen user-role notice message.
 * @param Body - the model-facing note text.
 * @param Summary - the one-line account (`<family> <kappa>`).
 */
declare function _default(Body: string, Summary: string): UserMessage;
/**
 * Prepend the suggester's notice while preserving every downstream context's
 * source and metadata (the tool-coach's prependContext).
 */
export declare const Prepend: (Ours: UserMessage, Theirs: readonly UserMessage[] | undefined) => UserMessage[];
