import type Touch from "../Interface/Touch.js";
/**
 * A candidate row: the followed path, how often it followed, and its score.
 */
export type Candidate = {
    readonly path: string;
    readonly count: number;
    readonly score: number;
};
export default _default;
declare function _default(Touches: readonly Touch[], Path: string, Options?: {
    readonly window?: number;
    readonly limit?: number;
}): readonly Candidate[];
