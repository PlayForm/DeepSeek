import type { UserMessage } from "@deepseek-ai/dsh-llm";
declare module "@deepseek-ai/dsh-llm" {
    interface MessageSourceMap {
        "tool-coach": {
            readonly kind: "tool-coach";
            readonly form: "notice";
            readonly summary: string;
        };
    }
}
/** Bind a notice summary to the harness's 120-char limit (ellipsized). */
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
