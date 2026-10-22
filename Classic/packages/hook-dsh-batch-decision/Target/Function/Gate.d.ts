import type { BatchDecision, BatchProposal } from "../Interface/Batch.js";
import type State from "../Interface/State.js";
export default _default;
/** Decide one proposal. Returns the recorded decision, or undefined when
 *  the proposal is unknown (never decided silently). */
declare function _default(State_: State, Proposal: BatchProposal, Outcome: "approved" | "denied", By: "user" | "policy"): BatchDecision | undefined;
