// Outcome - the result of one propose call (Interface/Outcome): exactly one
// of a created proposal or a typed refusal. Never both, never neither.
import type Proposal from "@Interface/Proposal.js";
import type Refusal from "@Interface/Refusal.js";

export default interface Outcome {
	status: "proposed" | "refused";
	proposal?: Proposal;
	refusal?: Refusal;
}
