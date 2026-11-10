import type State from "@Interface/State.js";
export default _default;
/**
 * @module Revoke
 *
 * The capability revocation path: mark the record revoked (permanent), stamp
 * the time, ledger.
 *
 * @remarks
 * Revocation timing is the policy's `revocationGraceMs` for the promote shield
 * (Function/Evict), not for the authorization: an authorization check reads
 * `revoked` directly and denies immediately.
 */
declare function _default(State: State, Id: string): boolean;
