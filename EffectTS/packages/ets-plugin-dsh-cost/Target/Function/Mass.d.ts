export default _default;
/**
 * @module Mass
 *
 * The surface replay (Documentation/Plans/COST-TRACK-PLUGIN.md section
 * 2.2): the model-visible surface of one session up to, not including, the
 * call being priced.
 *
 * @remarks
 *
 * Each surface message (system, user, assistant, tool result) is priced by
 * the estimator into Surface, and each tool result's tokens are carried to
 * the files its originating tool/call targeted - resolved from the same
 * walk, so a file's context mass is the share of the context it occupied
 * and the per-path masses never exceed the surface they came from. The walk
 * sees the whole session stream (the tool/call records between the surface
 * messages are the callId map's source, and the session header carries the
 * cwd the arguments resolve against); unknown shapes are skipped and the
 * walk never throws. A user/message that attached a file is not detectable
 * in the current log shape and contributes to no path.
 *
 * THE CACHE SPLIT: prompt caching is prefix-based, so the walk also carries
 * the CacheBudget (the call's cacheReadTokens) and splits every node's
 * tokens into the cached prefix portion - `min(nodeTokens, remaining
 * budget)` - and the uncached remainder, reported per path and in total as
 * Cached and CachedSurface. PerPath stays the TOTAL mass (cached plus
 * uncached), so the allocator and every existing caller keep their meaning.
 */
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
