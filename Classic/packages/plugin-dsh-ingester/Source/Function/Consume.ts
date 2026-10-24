// Consume - the `batch/decision` consumer (Function/Consume): THE TRACE
// ADAPTER the plan's target names. The ingester hears the decision on the
// bus, resolves the proposal it recorded from `batch/proposed`, and applies
// it through the existing content fence (Function/Apply) - so an approved
// batch is applied by the event path alone, with no caller wiring at all.
//
// A decision for a proposal the ingester never heard is refused with its own
// journal line - never applied against a guessed proposal.
import type Decision from "../Interface/Decision.js";
import type Proposal from "../Interface/Proposal.js";
import type Result from "../Interface/Result.js";
import type State from "../Interface/State.js";
import Claim from "./Claim.js";
import JournalFn from "./Journal.js";

/** The structural validation of a decision payload (the shape the consumer
 *  requires before it touches a field). */
const ValidDecision = (Value: unknown): Value is Decision => {
	const Decision = Value as Partial<Decision> | null;
	return (
		Decision !== null &&
		typeof Decision === "object" &&
		typeof Decision.proposal === "string" &&
		Decision.proposal.length > 0
	);
};

export default (State: State, Payload: unknown): Promise<Result | null> => {
	const Decision = Payload as Decision | undefined;
	switch (true) {
		case !ValidDecision(Decision):
			return Promise.resolve(null);
		default:
			break;
	}
	const Proposal: Proposal | undefined = State.Proposals.get(Decision.proposal);
	switch (true) {
		case Proposal === undefined:
			JournalFn(
				State,
				"unknown",
				Decision.proposal,
				"",
				"no proposal recorded for the decision",
			);
			return Promise.resolve(null);
		default:
			return Claim(State, Proposal, Decision);
	}
};
