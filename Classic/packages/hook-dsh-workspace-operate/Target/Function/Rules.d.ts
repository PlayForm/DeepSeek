import type Outcome from "@Interface/Outcome.js";
import type Proposal from "@Interface/Proposal.js";
import type State from "@Interface/State.js";
export default _default;
declare function _default(State: State, Kind: Proposal["kind"], Input: unknown): Promise<Outcome>;
