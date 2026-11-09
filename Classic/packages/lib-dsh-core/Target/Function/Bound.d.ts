export default _default;
/**
 * @module Bound
 *
 * The harness's bounded-render convention: render the first N items and report the
 * remainder instead of printing everything.
 *
 * @remarks
 * The shipped list pages bound the same way (`packages/schedule/schedule/src/index.ts:108-111`);
 * the cost report already caps at 20 (`plugin-dsh-cost/Source/Function/Apply.ts:191-203`).
 * Pure: the caller owns every string.
 */
declare function _default<Item>(Items: readonly Item[], Limit: number): {
    Shown: readonly Item[];
    More: number;
};
