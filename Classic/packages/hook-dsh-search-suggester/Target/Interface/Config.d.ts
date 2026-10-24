export default interface Config {
    /** Ledger enabled - write the durable log file (volatile). */
    log: boolean;
    /** Ledger file - the search suggester's own ledger, separate from the family's logs (volatile). */
    logFile: string;
    /** The master switch (volatile): false disables every listener to a passthrough. */
    enabled: boolean;
    /** The confidence gate (volatile): a note emits only at or above it; the destructive intents' pack thresholds (0.85) override per intent. */
    threshold: number;
    /** Maximum candidates in one note (volatile). */
    maxCandidates: number;
    /** Hard character cap on the note text (volatile). */
    maxNoteChars: number;
    /** No second note for the same intent within this many judged calls (volatile). */
    cooldownCalls: number;
    /** Maximum notes per turn, per agent (volatile). */
    maxNotesPerTurn: number;
    /** The enabled intent kinds, in priority order (volatile). */
    intents: string[];
    /** The tools whose calls are judged (volatile; write/edit/raw-write are learning-only, never noted). */
    emitOn: string[];
    /** The scope roots the answers can live in (volatile). */
    scopeRoots: string[];
    /** The excluded directories - a search inside them never notes (volatile). */
    exclude: string[];
    /** The online learner switch (volatile). */
    learn: boolean;
    /** The learner's observation window after a note (volatile). */
    learnWindow: number;
    /** The learned knowledge file (structural; remounts on edit). */
    persistPath: string;
    /** RETIRED by the P2 re-spec (the graph projection supersedes the generated index); never read (structural). */
    indexPath: string;
    /** The projection refresh switch: true rebuilds it on tools/change (structural). */
    refreshOnBoot: boolean;
    /** The dismissal TTL in seconds - `until = now + dismissTtl` (volatile). */
    dismissTtl: number;
    /** The offline seed switch - seed the knowledge at load (volatile). */
    seed: boolean;
    /** The second surface: "off" (the default) or "sticky" (volatile). */
    sectionMode: string;
    /** The sticky section's TTL in judged calls (volatile). */
    sectionTtl: number;
}
