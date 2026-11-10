import type Check from "../Interface/Check.js";
import type Request from "../Interface/Request.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Check
 *
 * The merge/execute side of the exact-approval contract (Function/Check):
 * does an APPROVED binding cover THIS EXACT change set?
 *
 * @remarks
 *
 * The guard chain, in order (each outcome its own honest decision):
 *
 *   1. no binding for the path + fingerprint -> `unbound`;
 *   2. a binding exists but is not `approved` -> its own decision
 *      (`pending`/`denied`/`rejected`/`revoked`/`invalidated`);
 *   3. an approved binding whose version differs from the request's ->
 *      `stale` - the candidate changed after the approval; an intent must
 *      not authorize its own means (the approval of an intention never
 *      authorizes the implementation produced later);
 *   4. otherwise -> `approved`.
 *
 * AN INTENT MUST NOT AUTHORIZE ITS OWN MEANS: this check validates the
 * implementation against the approved candidate, it never grants authority
 * by itself - the authority licensing happened earlier in the flow.
 */
declare function _default(State: State, Request: Request): Check;
