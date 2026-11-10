import type State from "../Interface/State.js";
export default _default;
/**
 * @module Clear
 *
 * The whole-batch reset (Function/Clear): drop every member, the queue and
 * the completions ring.
 *
 * @remarks
 *
 * The reset is ledgered and emitted with an empty member id (the whole-batch
 * change).
 */
declare function _default(State: State): void;
