// Entry - one spliced proposal's board record (Interface/Entry): the
// proposal itself plus the board's own status. The status starts `proposed`
// and moves exactly once per decision (approved / denied / expired); the
// board never decides - it reflects what the decision hook delivered into
// the same inbox channel.
import type Proposal from "@Interface/Proposal.js";

export default interface Entry {
	/** The proposal as it arrived (the contract, verbatim). */
	proposal: Proposal;
	/** The board's status for it. */
	status: "proposed" | "approved" | "denied" | "expired";
	/** When the board last touched the entry (epoch ms). */
	at: number;
}
