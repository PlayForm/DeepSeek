import type { Note } from "../Interface/Benchmark.js";
export default _default;
declare function _default(
/** The emitted notes of the replay (one per `suggest`). */
Notes: Note[], 
/** The hand-labelled eventual target set per intent. */
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
