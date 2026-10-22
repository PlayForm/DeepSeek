import type { UserMessage } from "@deepseek-ai/dsh-llm";
declare module "@deepseek-ai/dsh-llm" {
    interface MessageSourceMap {
        "search-suggester": {
            readonly kind: "search-suggester";
            readonly form: "notice";
            readonly summary: string;
        };
    }
}
/** Bind a notice summary to the harness's 120-char limit (ellipsized). */
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
