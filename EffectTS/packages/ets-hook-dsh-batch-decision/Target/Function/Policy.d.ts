import type { BatchProposal } from "../Interface/Batch.js";
import type State from "../Interface/State.js";
export type PolicyOutcome = "auto-approve" | "require-user";
export default _default;
declare function _default(State_: State, Proposal: BatchProposal): PolicyOutcome;
