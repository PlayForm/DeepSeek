export default _default;
declare function _default(Estimate: (Message: unknown) => number): (Events: readonly unknown[], CacheBudget: number) => {
    Surface: number;
    PerPath: Map<string, number>;
    Cached: Map<string, number>;
    CachedSurface: number;
};
