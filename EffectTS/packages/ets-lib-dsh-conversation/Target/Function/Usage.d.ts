export interface Fields {
    readonly Provider: string;
    readonly Model: string;
    readonly InputTokens: number;
    readonly OutputTokens: number;
    readonly CacheReadTokens: number | null;
}
export default _default;
declare function _default(Data: Record<string, unknown>): Fields;
