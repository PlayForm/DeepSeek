import type Check from "../Interface/Check.js";
import type Request from "../Interface/Request.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Check
 *
 * The merge/execute side of the exact-approval contract: does an APPROVED
 * binding cover THIS EXACT change set?
 *
 * @remarks
 *
 * The guard chain, in order (each outcome its own honest decision):
 *
 * 1. No binding for the path plus fingerprint -> `unbound`.
 * 2. A binding exists but is not `approved` -> its own decision
 *    (`pending`/`denied`/`rejected`/`revoked`/`invalidated`).
 * 3. An approved binding whose version differs from the request's -> `stale` -
 *    the candidate changed after the approval; an intent must not authorize its
 *    own means (the approval of an intention never authorizes the
 *    implementation produced later).
 * 4. Otherwise -> `approved`.
 *
 * An intent must not authorize its own means: this check validates the
 * implementation against the approved candidate, it never grants authority by
 * itself - the authority licensing happened earlier in the flow.
 *
 * The CALL-TIME master switch: a disabled hook refuses with `undefined` (the
 * approval contract is inactive - nothing is bound, nothing is approved) and
 * ZERO ledger lines (the live-flip law - State.On is read at the moment of
 * the call, never captured at mount).
 */
declare function _default(State: State, Request: Request): Check | undefined;
