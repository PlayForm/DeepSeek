// Policy - the auto-approve policy (Function/Policy). Conservative by
// default (PASS-ON-AND-INGESTER.md section 5): the first batch of an intent
// class ALWAYS requires the user; a policy auto-approval requires every one
// of: autoApprove "on", the intent in the allowlist, the target count
// within maxAutoTargets, the confidence at or above minConfidence, and at
// least one previous user approval of this intent class (the "learned
// allowlist from the accepted batches" seed - the first-batch rule). The
// policy never approves an expired proposal: that is the gate's outcome.
import type { BatchProposal } from "@Interface/Batch.js";
import type State from "@Interface/State.js";

export type PolicyOutcome = "auto-approve" | "require-user";

export default (State_: State, Proposal: BatchProposal): PolicyOutcome => {
	switch (true) {
		case State_.AutoApprove !== "on":
			return "require-user";
		case !State_.Allowlist.includes(Proposal.intent):
			return "require-user";
		case Proposal.targets.length > State_.MaxAutoTargets:
			return "require-user";
		case (Proposal.confidence ?? 0) < State_.MinConfidence:
			return "require-user";
		// The first batch of an intent class requires the user: the counter
		// only moves when a USER (not the policy) approves.
		case (State_.SeenIntents.get(Proposal.intent) ?? 0) < 1:
			return "require-user";
		default:
			return "auto-approve";
	}
};
