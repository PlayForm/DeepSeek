import type Decision from "../Interface/Decision.js";
import type Proposal from "../Interface/Proposal.js";
import type Result from "../Interface/Result.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Proposal: Proposal, Decision: Decision): Promise<Result>;
