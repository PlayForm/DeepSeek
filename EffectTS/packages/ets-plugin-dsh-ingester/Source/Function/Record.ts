// Record - the `batch/proposed` recorder (Function/Record): the ingester
// keeps the proposal the decision will name. Bounded by `maxProposals`
// (newest last) so a long session's proposal traffic cannot grow the
// service's memory without limit.
//
// Malformed traffic is ignored silently: the ingester is a consumer, and the
// producer-side packages (the board, the decision hook) already report a
// malformed proposal on their own ledgers.
import type Proposal from "../Interface/Proposal.js";
import type State from "../Interface/State.js";

/** The structural validation of a proposal payload (the shape the recorder
 *  keeps; the same checks the guard chain applied). */
const ValidProposal = (Value: unknown): Value is Proposal => {
	const Proposal = Value as Partial<Proposal> | null;
	return (
		Proposal !== null &&
		typeof Proposal === "object" &&
		typeof Proposal.id === "string" &&
		Proposal.id.length > 0 &&
		Array.isArray(Proposal.targets) &&
		Array.isArray(Proposal.operations)
	);
};

export default (State: State, Payload: unknown): void => {
	const Proposal = Payload as Proposal | undefined;
	switch (true) {
		case !ValidProposal(Proposal):
			return;
		default:
			break;
	}
	State.Proposals.set(Proposal.id, Proposal);
	while (State.Proposals.size > State.Config.maxProposals) {
		const Oldest = State.Proposals.keys().next().value;
		if (Oldest !== undefined) {
			State.Proposals.delete(Oldest);
		}
	}
};
