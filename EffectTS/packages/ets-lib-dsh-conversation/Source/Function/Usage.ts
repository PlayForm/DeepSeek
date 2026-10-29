// Usage - the shared read of one assistant/message's usage fields: the
// TokenUsage buckets (a missing bucket is an unreported one, null, charged at
// zero downstream) and the call's own source block (the provider and the
// model). Both Function/Fold (the State's Calls) and Function/Emits (the
// conversation/call envelope's payload) import this one module - the rule
// lives here alone.
export interface Fields {
	readonly Provider: string;
	readonly Model: string;
	readonly InputTokens: number;
	readonly OutputTokens: number;
	readonly CacheReadTokens: number | null;
}

// The field guards: a missing or alien field folds to its zero value, never
// thrown on.
const TextOf = (Value: unknown): string => (typeof Value === "string" ? Value : "");
const WholeOf = (Value: unknown): number | null => (typeof Value === "number" ? Value : null);

export default (Data: Record<string, unknown>): Fields => {
	const Usage = (Data["usage"] ?? {}) as Record<string, unknown>;
	const Message = (Data["message"] ?? {}) as Record<string, unknown>;
	const Source = (Message["source"] ?? {}) as Record<string, unknown>;
	return {
		Provider: TextOf(Source["provider"]),
		Model: TextOf(Source["model"]),
		InputTokens: WholeOf(Usage["inputTokens"]) ?? 0,
		OutputTokens: WholeOf(Usage["outputTokens"]) ?? 0,
		CacheReadTokens: WholeOf(Usage["cacheReadTokens"]),
	};
};
