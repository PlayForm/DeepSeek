import type Proposal from "./Proposal.js";
export default interface Entry {
    /** The proposal as it arrived (the contract, verbatim). */
    proposal: Proposal;
    /** The board's status for it. */
    status: "proposed" | "approved" | "denied" | "expired";
    /** When the board last touched the entry (epoch ms). */
    at: number;
}
