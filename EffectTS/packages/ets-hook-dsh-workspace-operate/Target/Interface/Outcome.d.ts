/**
 * @module Outcome
 *
 * The result of one propose call (Interface/Outcome).
 *
 * @remarks
 * Exactly one of a created proposal or a typed refusal. Never both, never
 * neither.
 */
import type Proposal from "./Proposal.js";
import type Refusal from "./Refusal.js";
export default interface Outcome {
    status: "proposed" | "refused";
    proposal?: Proposal;
    refusal?: Refusal;
}
