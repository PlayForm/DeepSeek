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
