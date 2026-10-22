// Withdraw - the withdrawal path (Function/Withdraw): marks one proposal
// `withdrawn`, persists the updated record, and ledgers
// `withdrawn <id>`. An unknown id is a false return - never an error,
// never a guessed proposal.
import Persist from "@Function/Persist.js";
import type State from "@Interface/State.js";

export default (State: State, Id: string): boolean => {
	const Proposal = State.Proposals.get(Id);
	if (Proposal === undefined || Proposal.status !== "proposed") {
		return false;
	}
	Proposal.status = "withdrawn";
	Persist(State, Proposal);
	State.Factory.Append(State, `withdrawn ${Id}`);
	return true;
};
