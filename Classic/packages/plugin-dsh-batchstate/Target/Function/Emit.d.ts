/**
 * @module Emit
 *
 * The batch/state-change emission: the plan's broadcast event (BATCH-STATE-PLUGIN.md section 2.1).
 *
 * @remarks
 * Emitted AFTER the state is updated and persisted; the consumers are the splice trigger and ANY
 * agent listening. Contained: a failed emission is swallowed (the family's silence invariant - a
 * dead listener can never break a state change), the failure is logged best-effort.
 */
import type Change from "../Interface/Change.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Change: Change): void;
