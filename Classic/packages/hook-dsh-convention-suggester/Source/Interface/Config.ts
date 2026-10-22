// Config - the validated plugin-config shape the loader hands to `apply`.
// Cordis validates the exported Schemastery schema while the plugin loads and
// fills every default, so `apply` receives a plain object of exactly this
// shape. The schema that produces it lives in Variable/Config.ts; every field
// here is a config field (the cordis.yml test - no hardcoded tunables).
//
// VOLATILE CELLS: `log`, `logFile` (the shared universal cells) plus every
// noise-control knob (enabled, threshold, maxCandidates, maxNoteChars,
// cooldownCalls, maxNotesPerTurn, intents, emitOn, exclude) are `.volatile()`
// in the schema - hot edits commit WITHOUT remounting the plugin, matching
// the tool-coach's and the search plan's posture (§4.8: every knob volatile).
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
}
