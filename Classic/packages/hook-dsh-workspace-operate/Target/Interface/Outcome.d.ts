import type Proposal from "./Proposal.js";
import type Refusal from "./Refusal.js";
export default interface Outcome {
    status: "proposed" | "refused";
    proposal?: Proposal;
    refusal?: Refusal;
}
