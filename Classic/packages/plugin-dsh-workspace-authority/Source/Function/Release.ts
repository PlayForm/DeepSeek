import type State from "@Interface/State.js";
import { ClosedWindow } from "@Variable/Config.js";

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
	// The closed-lease window: the most recent closed leases stay addressable
	// (the idempotent release and the statistic); beyond the cap the OLDEST
	// closed entries are forgotten - a Map preserves insertion order, so the
	// first key whose record is closed is the oldest.
	const Closed = [...State.Leases.entries()].filter(([, Lease]) => Lease.closed);
	let Excess = Closed.length - ClosedWindow;
	for (const [Forgotten] of Closed) {
		if (Excess <= 0) {
			break;
		}
		State.Leases.delete(Forgotten);
		Excess -= 1;
	}
	State.Factory.Append(State, `released ${Id}`);
	return true;
};
