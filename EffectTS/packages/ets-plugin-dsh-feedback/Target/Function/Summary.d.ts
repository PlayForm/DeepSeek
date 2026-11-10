/**
 * @module Summary
 *
 * The council view of one session: the aggregate signals for the recipient's deliberate review.
 *
 * @remarks
 * Plan section 2.2, `feedback/summary`. Pure read: no block is force-read, no status is touched.
 * The batch outcomes the orchestration layer reported ride along (the apply truth is part of the
 * council's knowledge).
 */
import type State from "../Interface/State.js";
import type Summary from "../Interface/Summary.js";
export default _default;
declare function _default(State: State, Session: string): Summary;
