// Learning - the learned layer's view (Function/Store builds it): the
// accept-rate reads the score consumes, the outcome writes the follow-through
// performs, and the decision-record memory.
//
// TWO BACKENDS, ONE CONTRACT: the shared pattern service (`ctx.get("pattern")`
// probed per use, never injected) is the PRIMARY - its records are the durable
// learned state, and a reopen reads them back; the in-memory bounded fallback
// (Function/Store, `storeLimit`) keeps the same arithmetic when no service is
// present. A missing store is the NEUTRAL path: every rate answers the
// Laplace prior 1/3, so the default score is byte-identical to the PoC.
import type Decision from "./Decision.js";

export default interface Learning {
	/** Which backend answers: the shared pattern service or the memory fallback. */
	Store(): "pattern" | "memory";
	/** The learned accept rates: the companion's row and its family's row. */
	Rate(Family: string, Path: string): { Companion: number; Family: number };
	/** Record one outcome for the family and every named companion. */
	Move(Family: string, Paths: string[], Outcome: "accepted" | "rejected"): void;
	/** Store one decision record (the pattern service, or the bounded memory ring). */
	Remember(Family: string, Paths: string[], Decision: Decision): void;
	/** Fill the stored decision record's outcome placeholder with the verdict. */
	Resolve(Family: string, Paths: string[], Outcome: "accepted" | "rejected"): void;
	/** The decision ring the store keeps in memory (bounded, newest last). */
	Recent(): Decision[];
}
