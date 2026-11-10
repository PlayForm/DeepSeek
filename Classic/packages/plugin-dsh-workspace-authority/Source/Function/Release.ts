import type State from "@Interface/State.js";

/**
 * @module Release
 *
 * The lease release path: close the record, ledger.
 *
 * @remarks
 *
 * Releasing an unknown or already-closed lease is reported honestly, never
 * faked.
 */
export default (State: State, Id: string): boolean => {
	const Record = State.Leases.get(Id);
	switch (true) {
		case Record === undefined:
			State.Factory.Append(State, `release failed ${Id} (unknown lease)`);
			return false;
		default:
			break;
	}
	switch (true) {
		case Record.closed:
			State.Factory.Append(State, `release ignored ${Id} (already closed)`);
			return false;
		default:
			break;
	}
	Record.closed = true;
	State.Factory.Append(State, `released ${Id}`);
	return true;
};
