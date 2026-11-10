import type Decision from "../Interface/Decision.js";
import type Proposal from "../Interface/Proposal.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Decide
 *
 * The gate decision combiner: the policy override first, then the
 * independent checks, then the record and the ledger line.
 *
 * @remarks
 *
 * The decision semantics:
 *
 *   * a policy rule forces its outcome (deny -> deny, escalate -> escalate,
 *     allow -> the checks still run - "allow" is an override of a WIDER
 *     deny, never a bypass of the checks);
 *   * the checks: any "denied" obligation denies (the first denied reason
 *     wins, in the fixed order contributes, scope, preconditions); any
 *     "recovery" obligation passes with a recovery ledger line (the table's
 *     fail-open behavior, never silent); "n/a" and "satisfied" pass;
 *   * every decision is recorded in the bounded ring and ledgered:
 *       govern: passed <operation> (<kind> <target>)
 *       govern: denied <operation> (<reason>)
 *       govern: escalated <operation> (approval required)
 *       govern: recovery <obligation> (fail-open)
 */
declare function _default(State: State, Proposal_: Proposal, Append: (Message: string) => void): Decision;
