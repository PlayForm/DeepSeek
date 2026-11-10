/**
 * @module Revoke
 *
 * The capability revocation path: mark the record revoked, ledger.
 *
 * @remarks
 * Revocation is permanent and stamps the time. Revocation timing is the
 * policy's `revocationGraceMs` for the promote shield (Function/Evict), not
 * for the authorization: an authorization check reads `revoked` directly
 * and denies immediately.
 */
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Id: string): boolean;
