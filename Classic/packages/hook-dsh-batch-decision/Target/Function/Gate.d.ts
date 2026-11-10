/**
 * @module Gate
 *
 * The decision gate: a BatchProposal becomes a BatchDecision.
 *
 * @remarks
 * Order of evaluation: expiry first (an expired proposal is "expired" by
 * "policy", whatever the caller requested), then the outcome and by as
 * given. Every decision is recorded on the pending entry and logged as one
 * ledger line by the caller; the gate logs nothing.
 */
import type { BatchDecision, BatchProposal } from "@Interface/Batch.js";
import type State from "@Interface/State.js";
export default _default;
/**
 * Decide one proposal. Returns the recorded decision, or undefined when the
 * proposal is unknown (never decided silently).
 */
declare function _default(State_: State, Proposal: BatchProposal, Outcome: "approved" | "denied", By: "user" | "policy"): BatchDecision | undefined;
