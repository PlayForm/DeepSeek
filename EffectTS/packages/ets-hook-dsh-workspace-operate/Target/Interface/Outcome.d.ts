import type Proposal from "@Interface/Proposal.js";
import type Refusal from "@Interface/Refusal.js";
/**
 * @module Outcome
 *
 * The result of one propose call (Interface/Outcome).
 *
 * @remarks
 *
 * Exactly one of a created proposal or a typed refusal. Never both, never
 * neither.
 */
export default interface Outcome {
    status: "proposed" | "refused";
    proposal?: Proposal;
    refusal?: Refusal;
}
