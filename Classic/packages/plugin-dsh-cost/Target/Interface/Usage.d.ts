export default interface Usage {
    readonly SessionId: string;
    readonly Turn: number;
    readonly Step: number;
    readonly Seq: number;
    readonly Provider: string;
    readonly Model: string;
    readonly InputTokens: number;
    readonly OutputTokens: number;
    readonly CacheReadTokens: number | null;
    readonly CacheWriteTokens: number | null;
    readonly ReasoningTokens: number | null;
    readonly TotalTokens: number | null;
    readonly At: number;
}
