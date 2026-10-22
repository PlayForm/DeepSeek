// Policy - the policy table lookup (Function/Policy): the first rule whose
// kind matches the proposal's kind (exactly or "*") and, when set, whose
// operation prefix matches the proposal's operation identifier, wins. No
// match returns undefined - the independent checks decide, which is the
// default posture (fail-open by design: the gate exists to check the
// proposals, not to block everything unlisted).
import type PolicyRule from "@Interface/Policy.js";
import type Proposal from "@Interface/Proposal.js";

export default (Rules: PolicyRule[], Proposal_: Proposal): PolicyRule | undefined =>
	Rules.find(
		(Rule) =>
			Rule &&
			(Rule.kind === "*" || Rule.kind === Proposal_.kind) &&
			(!Rule.operation || Proposal_.operation.startsWith(Rule.operation)),
	);
