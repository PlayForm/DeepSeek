import type Proposal from "@Interface/Proposal.js";
import type Refusal from "@Interface/Refusal.js";

/**
 * @module Outcome
 *
 * The result of one propose call: exactly one of a created proposal or a
 * typed refusal.
 *
 * @remarks
 *
 * Never both, never neither.
 */
export default interface Outcome {
	/**
	 * The call's verdict.
	 */
	status: "proposed" | "refused";

	/**
	 * The created proposal (present only when the status is "proposed").
	 */
	proposal?: Proposal;

	/**
	 * The typed refusal (present only when the status is "refused").
	 */
	refusal?: Refusal;
}
