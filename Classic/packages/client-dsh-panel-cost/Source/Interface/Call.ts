import type CostBuckets from "@Interface/Buckets.js";
import type CostFile from "@Interface/File.js";
import type CostTokens from "@Interface/Tokens.js";

/**
 * @module Call
 *
 * One ledger Call row.
 *
 * @remarks
 *
 * The shape is the Design.md section 9.4 one: the call's identity in the conversation grain (turn,
 * step, seq, at), the model and pricing facts, the token and cost buckets with `tokens.total` and
 * `cost.other` computed by the reader, the v4 telemetry carried as nullable because the live
 * ledger leaves it NULL and no column renders it, and the per-file money and touches folded into
 * `files`.
 */
export default interface CostCall {
	/**
	 * The turn the call belongs to.
	 */
	turn: number;
	/**
	 * The step the call belongs to.
	 */
	step: number;
	/**
	 * The call's position inside its step.
	 */
	seq: number;
	/**
	 * The call's start instant in epoch milliseconds.
	 */
	at: number;
	/**
	 * The provider the call named.
	 */
	provider: string;
	/**
	 * The model the call named.
	 */
	model: string;
	/**
	 * The mode the call named, an empty string when none.
	 */
	mode: string;
	/**
	 * The region the call named, or null.
	 */
	region: string | null;
	/**
	 * The tiling tier of the row, or null.
	 */
	tier: number | null;
	/**
	 * Whether the ledger priced the call.
	 */
	priced: boolean;
	/**
	 * The row's own currency.
	 */
	currency: string;
	/**
	 * The token buckets with `total` computed by the reader.
	 */
	tokens: CostTokens;
	/**
	 * The cost buckets with `other` computed by the reader.
	 */
	cost: CostBuckets;
	/**
	 * The signed net cache benefit.
	 */
	saving: number;
	/**
	 * The attempts the ledger recorded for the call.
	 */
	attempts: number;
	/**
	 * The error code the ledger recorded, or null.
	 */
	error: string | null;
	/**
	 * The v4 telemetry tokens total, nullable because the live ledger leaves it NULL.
	 */
	surfaceTokens: number;
	/**
	 * The v4 telemetry purpose, nullable because the live ledger leaves it NULL.
	 */
	purpose: string | null;
	/**
	 * The v4 telemetry context window, nullable because the live ledger leaves it NULL.
	 */
	contextWindow: number | null;
	/**
	 * The v4 telemetry utilization, nullable because the live ledger leaves it NULL.
	 */
	utilization: number | null;
	/**
	 * The v4 telemetry latency, nullable because the live ledger leaves it NULL.
	 */
	latencyMs: number | null;
	/**
	 * The v4 telemetry first-token latency, nullable because the live ledger leaves it NULL.
	 */
	firstTokenMs: number | null;
	/**
	 * The v4 telemetry throughput, nullable because the live ledger leaves it NULL.
	 */
	tokensPerSecond: number | null;
	/**
	 * The call's direct share of the file money.
	 */
	direct: number;
	/**
	 * The call's amortized share of the file money.
	 */
	amortized: number;
	/**
	 * How many file allocations the call carries.
	 */
	allocations: number;
	/**
	 * The per-file money and touches the fold carried into the call.
	 */
	files: readonly CostFile[];
}
