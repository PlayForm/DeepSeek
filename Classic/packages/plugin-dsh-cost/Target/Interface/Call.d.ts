import type CostBuckets from "./Buckets.js";
import type CostFile from "./File.js";
import type CostTokens from "./Tokens.js";
/**
 * @module Call
 *
 * One ledger Call row: the call's identity in the conversation grain, the
 * model and pricing facts, the token and cost buckets, the v4 telemetry and
 * the per-file money and touches folded into `files`.
 *
 * @remarks
 *
 * The shape follows Design.md section 9.4. `tokens.total` and `cost.other` are
 * computed by the reader. The v4 telemetry is carried as nullable because the
 * live ledger leaves it NULL and no column renders it.
 */
export default interface CostCall {
    /**
     * The conversation turn the call ran in.
     */
    turn: number;
    /**
     * The step of that turn the call ran in.
     */
    step: number;
    /**
     * The log sequence number the call was folded from.
     */
    seq: number;
    /**
     * The call's own instant, in epoch milliseconds.
     */
    at: number;
    /**
     * The provider id the call's source named.
     */
    provider: string;
    /**
     * The model id the call's source named.
     */
    model: string;
    /**
     * The pricing mode the call carried, "standard" by default.
     */
    mode: string;
    /**
     * The pricing region the call carried, null when the log named none.
     */
    region: string | null;
    /**
     * The resolved tier floor, null when the call carried no tier.
     */
    tier: number | null;
    /**
     * Whether the call resolved a price row; a false call is unpriced.
     */
    priced: boolean;
    /**
     * The currency the call's money is in.
     */
    currency: string;
    /**
     * The token buckets, with the total computed by the reader.
     */
    tokens: CostTokens;
    /**
     * The cost buckets, with the residual computed by the reader.
     */
    cost: CostBuckets;
    /**
     * The cache split's saving the drain measured.
     */
    saving: number;
    /**
     * The retry count, at least one.
     */
    attempts: number;
    /**
     * The first failure code, null when the call succeeded.
     */
    error: string | null;
    /**
     * The call's whole surface tokens.
     */
    surfaceTokens: number;
    /**
     * The purpose label the classifier wrote, null when unclassified.
     */
    purpose: string | null;
    /**
     * The provider-reported context window, null when unknown.
     */
    contextWindow: number | null;
    /**
     * The surface over the context window, null when either is unknown.
     */
    utilization: number | null;
    /**
     * The step-to-message latency, null when the ledger stores none.
     */
    latencyMs: number | null;
    /**
     * The first stream token's time0, null when the log carries none.
     */
    firstTokenMs: number | null;
    /**
     * The output tokens over the latency, null when either is missing.
     */
    tokensPerSecond: number | null;
    /**
     * The call's summed direct money.
     */
    direct: number;
    /**
     * The call's summed amortized money.
     */
    amortized: number;
    /**
     * The count of allocation rows the call carries.
     */
    allocations: number;
    /**
     * The per-file money and touches, folded one CostFile per FileId.
     */
    files: readonly CostFile[];
}
