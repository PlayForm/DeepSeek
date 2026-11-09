import type Proposal from "@Interface/Proposal.js";
import type Refusal from "@Interface/Refusal.js";
export default interface Outcome {
    status: "proposed" | "refused";
    proposal?: Proposal;
    refusal?: Refusal;
}
