import type Decision from "../Interface/Decision.js";
import type Proposal from "../Interface/Proposal.js";
export default _default;
/**
 * @module Validate
 *
 * The pre-apply checks.
 *
 * @remarks
 *
 * Plan section 4. The checks: the decision references
 * this proposal, is an approval, and the proposal is unexpired and carries
 * operations. The digest and versions are checked per target against the
 * live content (Function/Apply's fence) - not here. Returns the failure
 * reason, or null when valid.
 */
declare function _default(Proposal: Proposal, Decision: Decision, Now: number): string | null;
