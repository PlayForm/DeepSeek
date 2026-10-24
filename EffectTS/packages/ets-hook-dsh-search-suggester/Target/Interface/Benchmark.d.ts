export interface Note {
    /** The winning intent id (the note's family). */
    intent: string;
    /** The emitted candidate paths, in the note's order. */
    candidates: string[];
    /** The 1-based call index of the fixed sequence that emitted the note. */
    call: number;
}
