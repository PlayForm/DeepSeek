import type { UserMessage } from "@deepseek-ai/dsh-llm";
declare module "@deepseek-ai/dsh-llm" {
    interface MessageSourceMap {
        "convention-suggester": {
            readonly kind: "convention-suggester";
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
 * @param Summary - the one-line account (`<Intent> <k>`).
 */
declare function _default(Text: string, Summary: string): UserMessage;
/**
 * Prepend the suggester's notice while preserving every downstream context's
 * source and metadata (the tool-coach's Prepend).
 */
export declare const Prepend: (Ours: UserMessage, Theirs: readonly UserMessage[] | undefined) => UserMessage[];
