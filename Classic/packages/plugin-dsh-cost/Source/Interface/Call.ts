// Call - one ledger Call row (Design.md section 9.4): the call's identity
// in the conversation grain (turn, step, seq, at), the model and pricing
// facts, the token and cost buckets with `tokens.total` and `cost.other`
// computed by the reader, the v4 telemetry carried as nullable because the
// live ledger leaves it NULL and no column renders it, and the per-file
// money and touches folded into `files`.
import type CostBuckets from "@Interface/Buckets.js";
import type CostFile from "@Interface/File.js";
import type CostTokens from "@Interface/Tokens.js";

export default interface CostCall {
	turn: number;
	step: number;
	seq: number;
	at: number;
	provider: string;
	model: string;
	mode: string;
	region: string | null;
	tier: number | null;
	priced: boolean;
	currency: string;
	tokens: CostTokens;
	cost: CostBuckets;
	saving: number;
	attempts: number;
	error: string | null;
	surfaceTokens: number;
	purpose: string | null;
	contextWindow: number | null;
	utilization: number | null;
	latencyMs: number | null;
	firstTokenMs: number | null;
	tokensPerSecond: number | null;
	direct: number;
	amortized: number;
	allocations: number;
	files: readonly CostFile[];
}
