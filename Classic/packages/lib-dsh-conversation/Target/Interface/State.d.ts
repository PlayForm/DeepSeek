/** One assistant message's model call: the turn and step it ran in, the provider and model, and the usage buckets (a missing `cacheReadTokens` is an unreported bucket, `null`, never guessed). */
export interface Call {
    readonly Turn: number;
    readonly Step: number;
    readonly Provider: string;
    readonly Model: string;
    readonly InputTokens: number;
    readonly OutputTokens: number;
    readonly CacheReadTokens: number | null;
}
/** One tool call: the turn and step it ran in, the harness call id, and the tool name. */
export interface Tool {
    readonly Turn: number;
    readonly Step: number;
    readonly CallId: string;
    readonly Name: string;
}
/** One resolved file touch: the path (absolute, resolved against the session's cwd), the interaction kind, and the turn and step it happened in. */
export interface Touch {
    readonly Path: string;
    readonly Kind: "read" | "write" | "edit" | "delete" | "search";
    readonly Turn: number;
    readonly Step: number;
}
export default interface State {
    /** The current turn (0 before the first turn/start). */
    readonly Turn: number;
    /** The current step (0 before the first step/start). */
    readonly Step: number;
    /** One call per assistant/message, in sequence order. */
    readonly Calls: readonly Call[];
    /** One entry per tool/call, in sequence order. */
    readonly Tools: readonly Tool[];
    /** One entry per resolved file touch, in sequence order. */
    readonly Touches: readonly Touch[];
    /** The distinct touched paths, in first-seen order. */
    readonly Files: readonly string[];
}
