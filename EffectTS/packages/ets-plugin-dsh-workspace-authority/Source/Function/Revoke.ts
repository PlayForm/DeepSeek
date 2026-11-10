import type State from "@Interface/State.js";

/**
 * @module Revoke
 *
 * The capability revocation path: mark the record revoked, ledger.
 *
 * @remarks
 *
 * Revocation is permanent and stamps the time. Revocation timing is the
 * policy's `revocationGraceMs` for the promote shield (Function/Evict), not
 * for the authorization: an authorization check reads `revoked` directly
 * and denies immediately.
 */
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
