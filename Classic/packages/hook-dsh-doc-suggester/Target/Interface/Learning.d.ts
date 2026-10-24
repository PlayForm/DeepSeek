import type Decision from "./Decision.js";
export default interface Learning {
    /** Which backend answers: the shared pattern service or the memory fallback. */
    Store(): "pattern" | "memory";
    /** The learned accept rates: the companion's row and its family's row. */
    Rate(Family: string, Path: string): {
        Companion: number;
        Family: number;
    };
    /** Record one outcome for the family and every named companion. */
    Move(Family: string, Paths: string[], Outcome: "accepted" | "rejected"): void;
    /** Store one decision record (the pattern service, or the bounded memory ring). */
    Remember(Family: string, Paths: string[], Decision: Decision): void;
    /** Fill the stored decision record's outcome placeholder with the verdict. */
    Resolve(Family: string, Paths: string[], Outcome: "accepted" | "rejected"): void;
    /** The decision ring the store keeps in memory (bounded, newest last). */
    Recent(): Decision[];
}
