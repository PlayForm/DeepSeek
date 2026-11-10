import type { UserMessage } from "@deepseek-ai/dsh-llm";
/**
 * @module Note
 *
 * Builds the labeled additionalContexts notice the post-execute listener prepends.
 *
 * @remarks
 *
 * The additionalContexts notice builder (the plan's delivery surface,
 * SEARCH-SUGGESTER-PLUGIN.md §4.6 surface 1; the tool-coach precedent). Builds the
 * labeled UserMessage the post-execute listener prepends to the downstream decision's
 * additionalContexts.
 *
 * THE SOURCE LABEL IS LOAD-BEARING (the tool-coach precedent): an unlabeled context would
 * render as a user prompt in derived history. The label is
 * `{ kind: 'graph-suggester', form: 'notice', summary }` - the merge-extensible
 * MessageSource vocabulary (this module declares the suggester's own kind in its own
 * module, per the vocabulary's contract), with the `notice` form's required one-line
 * `summary` (`<Intent> <k>`, bound to the harness's 120-char summary limit).
 *
 * The message factory mirrors the @deepseek-ai/dsh-llm `createUserMessage` contract
 * LOCALLY (identified, deep-frozen, random UUID) - the hook bundles the same helper
 * instead of importing it, so the built Target carries no runtime import of the harness's
 * own packages.
 */
declare module "@deepseek-ai/dsh-llm" {
    interface MessageSourceMap {
        "graph-suggester": {
            readonly kind: "graph-suggester";
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
 *
 * @param Text - the model-facing note text.
 * @param Summary - the one-line account (`<Intent> <k>`).
 */
declare function _default(Text: string, Summary: string): UserMessage;
/**
 * Prepend the suggester's notice while preserving every downstream context's
 * source and metadata (the tool-coach's Prepend).
 */
export declare const Prepend: (Ours: UserMessage, Theirs: readonly UserMessage[] | undefined) => UserMessage[];
