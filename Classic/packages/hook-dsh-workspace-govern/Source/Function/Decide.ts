// Decide - the gate decision combiner (Function/Decide): the policy override
// first, then the independent checks, then the record and the ledger line.
// The decision semantics:
//
//   * a policy rule forces its outcome (deny -> deny, escalate -> escalate,
//     allow -> the checks still run - "allow" is an override of a WIDER
//     deny, never a bypass of the checks);
//   * the checks: any "denied" obligation denies (the first denied reason
//     wins, in the fixed order contributes, scope, preconditions); any
//     "recovery" obligation passes with a recovery ledger line (the table's
//     fail-open behavior, never silent); "n/a" and "satisfied" pass;
//   * every decision is recorded in the bounded ring and ledgered:
//       govern: passed <operation> (<kind> <target>)
//       govern: denied <operation> (<reason>)
//       govern: escalated <operation> (approval required)
//       govern: recovery <obligation> (fail-open)
import type Decision from "@Interface/Decision.js";
import type Proposal from "@Interface/Proposal.js";
import type State from "@Interface/State.js";

import Check from "./Check.js";
import Policy from "./Policy.js";

export default (State: State, Proposal_: Proposal, Append: (Message: string) => void): Decision => {
	const Obligations = Check(State, Proposal_);
	const Rule = Policy(State.PolicyRules, Proposal_);
	const Outcome = ((): { decision: Decision["decision"]; reason: string } => {
		switch (true) {
			case Rule !== undefined && Rule.decision === "deny":
				return { decision: "deny", reason: `policy: ${Rule.kind}` };
			case Rule !== undefined && Rule.decision === "escalate":
				return { decision: "escalate", reason: `policy: ${Rule.kind}` };
			case Obligations.contributes.startsWith("denied"):
				return { decision: "deny", reason: "contributes" };
			case Obligations.scope === "denied":
				return { decision: "deny", reason: "scope" };
			case Obligations.preconditions.startsWith("denied"):
				return {
					decision: "deny",
					reason: `precondition ${Obligations.preconditions.slice("denied:".length)}`,
				};
			default:
				return { decision: "pass", reason: "" };
		}
	})();
	const Record: Decision = {
		decision: Outcome.decision,
		reason: Outcome.reason,
		obligations: Obligations,
		operation: Proposal_.operation,
	};
	State.Sequence += 1;
	State.Decisions.push(Record);
	while (State.Decisions.length > State.MaxDecisions) {
		State.Decisions.shift();
	}
	for (const [Obligation, Result] of Object.entries(Obligations)) {
		if (Result === "recovery") {
			Append(`recovery ${Obligation} (fail-open)`);
		}
	}
	switch (true) {
		case Outcome.decision === "deny":
			Append(`denied ${Proposal_.operation} (${Outcome.reason})`);
			break;
		case Outcome.decision === "escalate":
			Append(`escalated ${Proposal_.operation} (approval required)`);
			break;
		default:
			Append(`passed ${Proposal_.operation} (${Proposal_.kind} ${Proposal_.target})`);
	}
	return Record;
};
