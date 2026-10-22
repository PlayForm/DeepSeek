// Release - the lease release path (Function/Release): close the record,
// ledger. Releasing an unknown or already-closed lease is reported honestly,
// never faked.
import type State from "@Interface/State.js";

export default (State: State, Id: string): boolean => {
	const Record = State.Leases.get(Id);
	switch (true) {
		case Record === undefined:
			State.Factory.Append(State, `release failed ${Id} (unknown lease)`);
			return false;
		case Record.closed:
			State.Factory.Append(State, `release ignored ${Id} (already closed)`);
			return false;
		default:
	}
	Record.closed = true;
	State.Factory.Append(State, `released ${Id}`);
	return true;
};
