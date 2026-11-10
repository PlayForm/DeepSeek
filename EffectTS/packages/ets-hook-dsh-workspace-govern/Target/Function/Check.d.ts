/**
 * @module Check
 *
 * The FOUR INDEPENDENT MEANS-CHECKS, one pure function of the proposal.
 *
 * @remarks
 * The intent-model semantics: an intent must not authorize its own means -
 * the gate runs the independent checks BEFORE any AuthorizationDecision,
 * and the intent is never the permission:
 *
 *   contributes      - the proposal declares a non-empty contribution (the
 *                      obligation evaluates "n/a" for a synthesized proposal:
 *                      the operate family has not attached a record yet, and
 *                      a plain tool call is not a declared intent);
 *   scope            - the target matches at least one glob of the
 *                      authorized-scope allowlist ("n/a" when the allowlist
 *                      is empty = unrestricted); UNEVALUABLE (a match error)
 *                      is the recovery table's scope row: fail-closed;
 *   preconditions    - an explicitly unsatisfied precondition DENIES;
 *                      unevaluable (missing) preconditions are the recovery
 *                      table's row.
 *
 * The outcome per obligation is one of: "satisfied", "denied", "n/a",
 * "recovery" (the row's behavior was applied). The policy lookup lives in
 * Function/Policy, the table in Function/Recovery - Check stays pure.
 */
import type { Obligations } from "../Interface/Check.js";
import type Proposal from "../Interface/Proposal.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Proposal_: Proposal): Obligations;
