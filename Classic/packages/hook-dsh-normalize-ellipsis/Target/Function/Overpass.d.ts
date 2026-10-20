import type { PostToolDecision, ToolExecution, ToolExecutionResult } from "@deepseek-ai/dsh-tools";
import type State from "@Interface/State.js";
/** The schema-default scopes (the fallback for a hand-built config). */
export declare const DefaultScopes: {
    conversation: boolean;
    reasoning: boolean;
    toolInput: boolean;
    toolResults: boolean;
    files: boolean;
    batch: boolean;
};
/** The schema-default exemption list (the fallback for a hand-built config). */
export declare const DefaultExempt: string[];
/** The ccr spill marker's opening bytes - content carrying them is a ccr
 *  replacement and passes through untouched (the order-safety guard). */
export declare const CCRMarker = "<<<CCR:";
/** A structural content block: the only field the arm reads is the text. */
export type Block = {
    type?: unknown;
    text?: unknown;
};
/** Rewrite the TEXT blocks of one content array through the given transform.
 *  Returns a copy with the text blocks rewritten, or the ORIGINAL array by
 *  identity when nothing changed (the N = 0 no-op rule). `Count` accumulates
 *  the replaced characters. */
export declare const RewriteBlocks: (Content: readonly Block[], Transform: (Text: string) => {
    text: string;
    count: number;
}, Count: {
    value: number;
}) => Block[];
export default _default;
/** The tools/post-execute arm (the listener body; Function/Apply registers
 *  it with `{ prepend: true }`). */
declare function _default(Exec: ToolExecution, Result: ToolExecutionResult, Next: () => Promise<PostToolDecision>, State: State): Promise<PostToolDecision>;
