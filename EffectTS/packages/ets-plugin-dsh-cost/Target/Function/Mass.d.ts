export default _default;
/**
 * The session surface walk: one call's context masses over the files its
 * replay named.
 */
declare function _default(Estimate: (Message: unknown) => number): (Events: readonly unknown[], CacheBudget: number) => {
    Surface: number;
    PerPath: Map<string, number>;
    Cached: Map<string, number>;
    CachedSurface: number;
};
