import type Decision from "../Interface/Decision.js";
import type Proposal from "../Interface/Proposal.js";
import type Result from "../Interface/Result.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Apply
 *
 * The batch's write path (plan section 4): validate the decision, then per
 * target, in the proposal's order: resolve, verify the version fence (the
 * content sha256 must still match), apply the operations through the governed
 * filesystem (fs.editText with the version guard - the version-fenced literal
 * edit), journal before and after.
 *
 * @remarks
 *
 * A conflict stops at that target (when stopOnConflict); the applied targets
 * are reported honestly - no invisible intermediate state.
 */
declare function _default(State: State, Proposal: Proposal, Decision: Decision): Promise<Result>;
