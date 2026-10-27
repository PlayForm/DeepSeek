// Usage - the priced usage record for one model call, read from the session
// log's assistant/message event (Documentation/Plans/COST-TRACK-PLUGIN.md
// section 1): the provider's own token numbers with the turn, the step and
// the sequence of the record they came from. The buckets follow TokenUsage
// exactly, and the live verification showed totalTokens = inputTokens +
// cacheReadTokens + outputTokens, so InputTokens is the UNCACHED remainder
// and pricing must never treat it as the whole input. A null bucket is an
// unreported bucket, charged at zero, never guessed.
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
