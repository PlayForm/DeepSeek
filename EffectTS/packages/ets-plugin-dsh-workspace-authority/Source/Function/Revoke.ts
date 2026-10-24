// Revoke - the capability revocation path (Function/Revoke): mark the record
// revoked (permanent), stamp the time, ledger. Revocation timing is the
// policy's `revocationGraceMs` for the promote shield (Function/Evict), not
// for the authorization: an authorization check reads `revoked` directly and
// denies immediately.
import type State from "@Interface/State.js";

export default (State: State, Id: string): boolean => {
	const Record = State.Capabilities.get(Id);
	switch (true) {
		case Record === undefined:
			State.Factory.Append(State, `revoke failed ${Id} (unknown capability)`);
			return false;
		default:
			break;
	}
	switch (true) {
		case Record.revoked:
			State.Factory.Append(State, `revoke ignored ${Id} (already revoked)`);
			return false;
		default:
			break;
	}
	Record.revoked = true;
	Record.revokedAt = Date.now();
	State.Factory.Append(State, `revoked ${Id}`);
	return true;
};
