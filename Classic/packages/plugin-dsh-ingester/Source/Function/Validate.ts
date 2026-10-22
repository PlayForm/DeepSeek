// Validate - the pre-apply checks (plan section 4): the decision references
// this proposal, is an approval, and the proposal is unexpired and carries
// operations. The digest and versions are checked per target against the
// live content (Function/Apply's fence) - not here. Returns the failure
// reason, or null when valid.
import type Decision from "../Interface/Decision.js";
import type Proposal from "../Interface/Proposal.js";

export default (Proposal: Proposal, Decision: Decision, Now: number): string | null => {
	switch (true) {
		case Decision.proposal !== Proposal.id:
			return "decision does not reference this proposal";
		case Decision.outcome === "denied":
			return "decision denied the proposal";
		case Decision.outcome === "expired":
			return "decision recorded the proposal as expired";
		case Decision.outcome !== "approved":
			return "decision is not an approval";
		case Proposal.expiresAt <= Now:
			return "proposal expired";
		case Proposal.operations.length === 0:
			return "proposal carries no operations";
		default:
			return null;
	}
};
