/**
 * @module Usage
 *
 * The priced usage record for one model call, read from the session log's
 * assistant/message event: the provider's own token numbers with the turn, the
 * step and the sequence of the record they came from.
 *
 * @remarks
 *
 * The shape follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section 1. The
 * buckets follow TokenUsage exactly, and the live verification showed
 * totalTokens = inputTokens + cacheReadTokens + outputTokens, so InputTokens
 * is the UNCACHED remainder and pricing must never treat it as the whole input.
 * A null bucket is an unreported bucket, charged at zero, never guessed. The
 * factor layer's optional dimensions (section 17.1): Mode is the pricing mode
 * the call ran in (standard when the log carries no signal) and Region the
 * residency region (null when the log carries no signal); both default at the
 * drain.
 */
export default interface Usage {
	/**
	 * The session the call belongs to.
	 */
	readonly SessionId: string;
	/**
	 * The conversation turn the call ran in.
	 */
	readonly Turn: number;
	/**
	 * The step of that turn the call ran in.
	 */
	readonly Step: number;
	/**
	 * The log sequence number of the record the usage came from.
	 */
	readonly Seq: number;
	/**
	 * The provider the call ran against.
	 */
	readonly Provider: string;
	/**
	 * The model the call ran with.
	 */
	readonly Model: string;
	/**
	 * The uncached input tokens, never the whole input.
	 */
	readonly InputTokens: number;
	/**
	 * The output tokens.
	 */
	readonly OutputTokens: number;
	/**
	 * The cache-read tokens, null when unreported.
	 */
	readonly CacheReadTokens: number | null;
	/**
	 * The cache-write tokens, null when unreported.
	 */
	readonly CacheWriteTokens: number | null;
	/**
	 * The reasoning tokens, null when unreported.
	 */
	readonly ReasoningTokens: number | null;
	/**
	 * The reported total, null when unreported.
	 */
	readonly TotalTokens: number | null;
	/**
	 * The call's instant, in epoch milliseconds.
	 */
	readonly At: number;
	/**
	 * The pricing mode, "standard" when the log carries no signal.
	 */
	readonly Mode?: string;
	/**
	 * The residency region, null when the log carries no signal.
	 */
	readonly Region?: string | null;
}
