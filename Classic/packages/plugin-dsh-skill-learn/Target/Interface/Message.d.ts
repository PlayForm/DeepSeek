export interface TextBlock {
    readonly type: "text";
    readonly text: string;
}
export interface ToolCallBlock {
    readonly type: "tool-call";
    /** The tool's name; absent when the model's call carried none. */
    readonly name?: string;
}
/** The two block types this plugin reads; every other block is dropped upstream. */
export type ContentBlock = TextBlock | ToolCallBlock;
export default interface Message {
    /**
     * The five roles the harness's message map closes over. `developer` is
     * included for completeness: a projected history may carry one, and the
     * digest must be able to state that it contributes nothing.
     */
    readonly role: "system" | "user" | "assistant" | "tool" | "developer";
    /** The model-facing blocks, in order. */
    readonly content: readonly ContentBlock[];
}
