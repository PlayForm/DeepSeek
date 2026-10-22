import type { UserMessage } from "@deepseek-ai/dsh-llm";
declare module "@deepseek-ai/dsh-llm" {
    interface MessageSourceMap {
        "doc-suggester": {
            readonly kind: "doc-suggester";
            readonly form: "notice";
            readonly summary: string;
        };
    }
}
/** Bind a notice summary to the harness's 120-char limit (ellipsized). */
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
