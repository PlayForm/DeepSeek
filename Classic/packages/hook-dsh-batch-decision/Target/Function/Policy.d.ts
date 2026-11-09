/**
 * @module Policy
 *
 * The auto-approve policy, conservative by default (PASS-ON-AND-INGESTER.md
 * section 5).
 *
 * @remarks
 * The first batch of an intent class ALWAYS requires the user; a policy
 * auto-approval requires every one of: autoApprove "on", the intent in the
 * allowlist, the target count within maxAutoTargets, the confidence at or
 * above minConfidence, and at least one previous user approval of this
 * intent class (the "learned allowlist from the accepted batches" seed - the
 * first-batch rule). The policy never approves an expired proposal: that is
 * the gate's outcome.
 */
import type { BatchProposal } from "../Interface/Batch.js";
import type State from "../Interface/State.js";
export type PolicyOutcome = "auto-approve" | "require-user";
export default _default;
declare function _default(State_: State, Proposal: BatchProposal): PolicyOutcome;
