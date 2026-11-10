import type State from "@Interface/State.js";
export default _default;
/**
 * @module Withdraw
 *
 * The withdrawal path: marks one proposal `withdrawn`, persists the updated
 * record, and ledgers `withdrawn <id>`.
 *
 * @remarks
 *
 * An unknown id is a false return - never an error, never a guessed
 * proposal.
 */
declare function _default(State: State, Id: string): boolean;
