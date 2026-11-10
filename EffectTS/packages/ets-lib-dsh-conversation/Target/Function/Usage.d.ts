/**
 * @module Usage
 *
 * The shared read of one assistant/message's usage fields.
 *
 * @remarks
 *
 * The read covers the TokenUsage buckets (a missing bucket is an unreported
 * one, null, charged at zero downstream) and the call's own source block
 * (the provider and the model). Both Function/Fold (the State's Calls) and
 * Function/Emits (the conversation/call envelope's payload) import this one
 * module - the rule lives here alone.
 */
export interface Fields {
    readonly Provider: string;
    readonly Model: string;
    readonly InputTokens: number;
    readonly OutputTokens: number;
    readonly CacheReadTokens: number | null;
}
export default _default;
declare function _default(Data: Record<string, unknown>): Fields;
