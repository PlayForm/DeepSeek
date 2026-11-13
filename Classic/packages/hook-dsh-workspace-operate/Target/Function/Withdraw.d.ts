import type State from "../Interface/State.js";
export default _default;
/**
 * @module Withdraw
 *
 * The withdrawal path: it marks one proposal `withdrawn`, persists the
 * updated record, and ledgers the line.
 *
 * @remarks
 *
 * The ledger line is `withdrawn <id>`. An unknown id is a false return -
 * never an error, never a guessed proposal.
 *
 * The CALL-TIME master switch: a disabled hook refuses with `false` and
 * ZERO ledger lines (the live-flip law - State.On is read at the moment of
 * the call, never captured at mount).
 */
declare function _default(State: State, Id: string): boolean;
