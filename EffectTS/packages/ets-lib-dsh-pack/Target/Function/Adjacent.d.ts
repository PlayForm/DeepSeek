/**
 * @module Adjacent
 *
 * Folds the session history into the co-touch candidates for one path.
 *
 * @remarks
 * For every call that touched the anchor path, the calls that follow it within
 * the window contribute `1 / (1 + distance)` to the followed path's score and
 * one to its count, so a repeatedly co-touched path outranks a single one and a
 * near neighbour outranks a far one. The anchor itself is never a candidate.
 * Pure and deterministic - no I/O, no ordering surprises.
 */
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
