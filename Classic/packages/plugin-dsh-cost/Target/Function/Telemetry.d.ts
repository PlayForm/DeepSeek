/**
 * @module Telemetry
 *
 * The signals the session log already carries: one session's records walked in
 * order for the retry count, the step-to-message latency, the first-token
 * latency, the tokens-per-second rate, the utilization and the first failure
 * code.
 *
 * @remarks
 *
 * The walk follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section 17.4. The
 * retry count counts the assistant/attempt events between a step/start and the
 * assistant/message (one when none); the first stream record's time0 is the
 * perceived first-token latency; the tokens-per-second rate is the message's
 * own output tokens over the latency; the utilization is the call's surface
 * tokens over the context window, both known; and the first failure code is a
 * tool/result.error.code, else the turn/end reason kind.
 *
 * The context window and the surface are the harness token meter's figures, not
 * a request/context record the walk re-derives (Reuse-Host.md:27, 64;
 * token-meter/README.md:36-49): `contextPressure(session)` carries the newest
 * provider-reported `contextWindow`, and `measure(session).surfaceTokens` is
 * the surface used when the caller passes none. The meter is projection-backed
 * and replay-stable, so the window is the provider's own number. It claims
 * nothing else: latency, attempts, first-token time and the error code stay
 * derived here, and a figure the meter does not report stays null rather than
 * guessed.
 *
 * Unknown shapes are skipped and the walk never throws.
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
type TokenMeter = {
    measure: (Session: unknown) => {
        totalTokens: number;
        surfaceTokens: number;
        nodes: readonly unknown[];
    };
    contextPressure: (Session: unknown) => {
        contextWindow?: number;
        pressureTokens?: number;
        projectedTokens?: number;
    };
};
export default _default;
declare function _default(Meter: TokenMeter, Session: unknown, Records: readonly unknown[], SurfaceTokens: number): Measured;
