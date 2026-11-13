import Persist from "@Function/Persist.js";
import type State from "@Interface/State.js";

/**
 * @module Withdraw
 *
 * The withdrawal path: it marks one proposal `withdrawn`, persists the
 * updated record, and ledgers the line.
 *
 * @remarks
 *
 * The ledger line is `withdrawn <id>`. An unknown id is a false return -
 * never an error, never a guessed proposal.
 *
 * The CALL-TIME master switch: a disabled hook refuses with `false` and
 * ZERO ledger lines (the live-flip law - State.On is read at the moment of
 * the call, never captured at mount).
 */
export default (State: State, Id: string): boolean => {
	switch (true) {
		case State.On === false:
			return false;
		default:
	}
	const Proposal = State.Proposals.get(Id);
	if (Proposal === undefined || Proposal.status !== "proposed") {
		return false;
	}
	Proposal.status = "withdrawn";
	Persist(State, Proposal);
	State.Factory.Append(State, `withdrawn ${Id}`);
	return true;
};
