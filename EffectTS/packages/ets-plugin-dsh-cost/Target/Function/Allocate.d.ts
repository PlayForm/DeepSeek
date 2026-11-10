import type Allocation from "../Interface/Allocation.js";
import type Config from "../Interface/Config.js";
import type Touch from "../Interface/Touch.js";
import type Usage from "../Interface/Usage.js";
/**
 * @module Allocate
 *
 * The attribution model (Documentation/Plans/COST-TRACK-PLUGIN.md section
 * 2): one call's price split into the direct half and the amortized half,
 * plus the one unattributed row.
 *
 * @remarks
 *
 * The direct half is the output side - the model's decision to act -
 * weighted by changed bytes over the files the step wrote. The amortized
 * half is the input side - the context that made the decision possible -
 * split per cache bucket: the uncached input weighted by each file's
 * uncached mass, the cached input by its cached mass, because one blended
 * ratio misprices a file whose tokens are cached against one whose are
 * not. The unattributed row absorbs the shared remainder and keeps the
 * conservation law (section 2.3): the sum of every row equals the call's
 * CostTotal within 1e-9, asserted here because a violation is a bug in the
 * allocator, not a rounding artifact to be waved through. With no cache
 * data the cached half is empty and the whole mass is uncached, so the old
 * call shape behaves exactly as before.
 */
/**
 * One priced call.
 */
type Costed = {
    Input: number;
    Output: number;
    CacheRead: number;
    CacheWrite: number;
    Reasoning: number;
    Total: number;
    Currency: string;
};
/**
 * One step's context masses over the touched files.
 */
type Massed = {
    Surface: number;
    PerPath: Map<string, number>;
    Cached?: Map<string, number>;
    CachedSurface?: number;
};
export default _default;
declare function _default(Usage: Usage, Cost: Costed, Touches: readonly Touch[], Mass: Massed, Config: Config): readonly Allocation[];
