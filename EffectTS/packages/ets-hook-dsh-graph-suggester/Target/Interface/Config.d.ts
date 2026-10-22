export default interface Config {
    /** Ledger enabled - write the durable log file (volatile). */
    log: boolean;
    /** Ledger file - the hook's own ledger, separate from the family's logs (volatile). */
    logFile: string;
    /** Master switch - when false, the hook logs `disabled (enabled=false)` and every listener passes through (volatile). */
    enabled: boolean;
    /** The default confidence gate (volatile; the pack's per-intent thresholds may raise it). */
    threshold: number;
    /** Maximum candidates in one note (volatile). */
    maxCandidates: number;
    /** Hard character cap on the note text (volatile). */
    maxNoteChars: number;
    /** No second note for the same intent within this many judged calls (volatile). */
    cooldownCalls: number;
    /** Maximum notes per agent turn (volatile). */
    maxNotesPerTurn: number;
    /** The enabled intent ids - a pack intent not listed here never fires (volatile). */
    intents: string[];
    /** The tool names the hook judges (volatile; other tools pass through silently). */
    emitOn: string[];
    /** Path prefixes a candidate is never drawn from (volatile). */
    exclude: string[];
    /** Whether the graph-based Neighborhood intent may fire at all (volatile; false = static intents only). */
    graph: boolean;
}
