import type PolicyRule from "../Interface/Policy.js";
import type Proposal from "../Interface/Proposal.js";
export default _default;
/**
 * @module Policy
 *
 * The policy table lookup: the first rule whose kind and operation match.
 *
 * @remarks
 *
 * The first rule whose kind matches the proposal's kind (exactly or "*")
 * and, when set, whose operation prefix matches the proposal's operation
 * identifier, wins. No match returns undefined - the independent checks
 * decide, which is the default posture (fail-open by design: the gate
 * exists to check the proposals, not to block everything unlisted).
 */
declare function _default(Rules: PolicyRule[], Proposal_: Proposal): PolicyRule | undefined;
