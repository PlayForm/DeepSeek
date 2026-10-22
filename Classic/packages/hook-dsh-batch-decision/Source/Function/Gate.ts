// Gate - the decision gate (Function/Gate): the BatchProposal -> the
// BatchDecision. Order of evaluation: expiry first (an expired proposal is
// "expired" by "policy", whatever the caller requested), then the outcome
// and by as given. Every decision is recorded on the pending entry and
// logged as one ledger line by the caller; the gate logs nothing.
import type { BatchDecision, BatchProposal } from "@Interface/Batch.js";
import type State from "@Interface/State.js";

import { Decide, ExpiredDecision, Now } from "./Proposals.js";

/** Decide one proposal. Returns the recorded decision, or undefined when
 *  the proposal is unknown (never decided silently). */
export default (
	State_: State,
	Proposal: BatchProposal,
	Outcome: "approved" | "denied",
	By: "user" | "policy",
): BatchDecision | undefined => {
	const Entry = State_.Pending.get(Proposal.id);
	if (Entry === undefined) {
		return undefined;
	}
	const Expired = ExpiredDecision(State_, Entry);
	const Decision: BatchDecision = Expired ?? {
		proposal: Proposal.id,
		outcome: Outcome,
		by: By,
		at: Now(State_),
	};
	Decide(State_, Decision);
	return Decision;
};
