import type State from "../Interface/State.js";
import type Statistics from "../Interface/Statistics.js";
export default _default;
/**
 * @module Statistics
 *
 * The counts over the valid in-memory mirror.
 *
 * @remarks
 *
 * The counts are the stored file count, the total node and edge counts, and
 * the current indexRevision.
 */
declare function _default(StateRef: State): Statistics;
