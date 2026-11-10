import type Decision from "../Interface/Decision.js";
import type Proposal from "../Interface/Proposal.js";
export default _default;
/**
 * @module Validate
 *
 * The pre-apply checks (plan section 4): the decision references this
 * proposal, is an approval, and the proposal is unexpired and carries
 * operations.
 *
 * @remarks
 *
 * The digest and versions are checked per target against the live content
 * (Function/Apply's fence) - not here. Returns the failure reason, or null
 * when valid.
 */
declare function _default(Proposal: Proposal, Decision: Decision, Now: number): string | null;
