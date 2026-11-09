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
