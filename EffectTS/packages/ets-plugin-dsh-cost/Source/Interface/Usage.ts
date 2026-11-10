/**
 * @module Usage
 *
 * The priced usage record for one model call, read from the session log's
 * assistant/message event (Documentation/Plans/COST-TRACK-PLUGIN.md section
 * 1): the provider's own token numbers with the turn, the step and the
 * sequence of the record they came from.
 *
 * @remarks
 *
 * The buckets follow TokenUsage exactly, and the live verification showed
 * totalTokens = inputTokens + cacheReadTokens + outputTokens, so
 * InputTokens is the UNCACHED remainder and pricing must never treat it as
 * the whole input. A null bucket is an unreported bucket, charged at zero,
 * never guessed. The factor layer's optional dimensions (section 17.1):
 * Mode is the pricing mode the call ran in (standard when the log carries
 * no signal) and Region the residency region (null when the log carries no
 * signal); both default at the drain.
 */

/**
 * One model call's usage record.
 */
export default interface Usage {
	/**
	 * The session the call happened in.
	 */
	readonly SessionId: string;

	/**
	 * The call's turn.
	 */
	readonly Turn: number;

	/**
	 * The call's step.
	 */
	readonly Step: number;

	/**
	 * The record's sequence number.
	 */
	readonly Seq: number;

	/**
	 * The provider that served the call.
	 */
	readonly Provider: string;

	/**
	 * The model that served the call.
	 */
	readonly Model: string;

	/**
	 * The uncached input tokens.
	 */
	readonly InputTokens: number;

	/**
	 * The output tokens.
	 */
	readonly OutputTokens: number;

	/**
	 * The cache-read tokens (null is unreported).
	 */
	readonly CacheReadTokens: number | null;

	/**
	 * The cache-write tokens (null is unreported).
	 */
	readonly CacheWriteTokens: number | null;

	/**
	 * The reasoning tokens (null is unreported).
	 */
	readonly ReasoningTokens: number | null;

	/**
	 * The total tokens (null is unreported).
	 */
	readonly TotalTokens: number | null;

	/**
	 * The call's instant (epoch ms).
	 */
	readonly At: number;

	/**
	 * The pricing mode the call ran in.
	 */
	readonly Mode?: string;

	/**
	 * The residency region the call ran in.
	 */
	readonly Region?: string | null;
}
