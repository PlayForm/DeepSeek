/**
 * @module Telemetry
 *
 * The signals the session log already carries
 * (Documentation/Plans/COST-TRACK-PLUGIN.md section 17.4): one session's
 * records walked in order.
 *
 * @remarks
 * The walk answers the retry count (the assistant/attempt events between a
 * step/start and the assistant/message, one when none), the step-to-message
 * latency, the first stream record's time0 (the perceived first-token
 * latency), the tokens-per-second rate (the message's own output tokens
 * over the latency), the last request/context's contextWindow, the
 * utilization (the call's surface tokens over that window, both known) and
 * the first failure code (a tool/result.error.code, else the turn/end
 * reason kind). Unknown shapes are skipped and the walk never throws.
 */
/**
 * One message's measured telemetry.
 */
type Measured = {
    Attempts: number;
    LatencyMs: number | null;
    FirstTokenMs: number | null;
    TokensPerSecond: number | null;
    ContextWindow: number | null;
    Utilization: number | null;
    ErrorCode: string | null;
};
export default _default;
declare function _default(Records: readonly unknown[], SurfaceTokens: number): Measured;
