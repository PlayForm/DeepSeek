/**
 * @module Guard
 *
 * The recursion-prevention guard: the operation identifier's gated count.
 *
 * @remarks
 * Every proposal carries the operation identifier, the parent identifier and
 * the event category (the distribution law), and an operation identifier gated
 * more than the loop bound is DROPPED - the gate returns a pass-through and
 * ledger `loop <operation> (recursion guard)`, so a self-feeding operation can
 * never re-enter the gate without end. The count map is capped (the oldest
 * entries dropped, the cap is ledgered) so a long session cannot grow it
 * without end.
 */
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Operation: string, Append: (Message: string) => void): boolean;
