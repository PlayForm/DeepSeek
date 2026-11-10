/**
 * @module Benchmark
 *
 * The P4 REPLAY BENCHMARK scorer (the plan's section 10.5): a fixed call
 * sequence replayed through the real built listener yields a set of emitted
 * notes; this module scores them against the hand-labelled eventual target
 * sets and reports the suggestion precision and recall.
 *
 * @remarks
 * The metrics (deterministic, no clock, no I/O):
 *
 *   precision = the suggested candidates that hit an expected target, over
 *               every suggested candidate (the cost of a wrong target - the
 *               plan's asymmetry: a wrong suggestion is worse than none);
 *   recall    = the expected targets that a suggestion named, over every
 *               expected target (the first-hit accuracy of the plan's
 *               section 10.2, measured over the whole lane);
 *   first     = the call index of the first emitted note (the plan's
 *               first-edit comparison anchor).
 *
 * A suggestion may be a glob (a family row): it hits when it matches an
 * expected path. The notes are grouped by intent, so two notes of the same
 * intent contribute one union of candidates.
 */
import type { Note } from "../Interface/Benchmark.js";
export default _default;
declare function _default(
/**
 * The emitted notes of the replay (one per `suggest`).
 */
Notes: Note[], 
/**
 * The hand-labelled eventual target set per intent.
 */
Expected: Record<string, string[]>): {
    Notes: number;
    Suggested: number;
    Hits: number;
    Expected: number;
    Matched: number;
    Precision: number;
    Recall: number;
    First: number;
};
