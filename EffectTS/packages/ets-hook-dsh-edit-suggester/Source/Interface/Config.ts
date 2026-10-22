// Config - the validated plugin-config shape the loader hands to `apply`.
// Cordis validates the exported Schemastery schema while the plugin loads and
// fills every default, so `apply` receives a plain object of exactly this
// shape. The schema that produces it lives in Variable/Config.ts; every field
// here is a config field (the cordyml test - no hardcoded tunables).
//
// VOLATILE CELLS: `log`, `logFile`, plus every tuning knob of the hot-editable
// posture (`enabled`, `threshold`, `tools`, `maxCompanions`, `maxNoteChars`,
// `cooldownCalls`, `maxNotesPerTurn`, `exclude`) are `.volatile()` in the
// schema - hot edits commit WITHOUT remounting the plugin.
export default interface Config {
	/** Ledger enabled - write the durable log file (volatile). */
	log: boolean;
	/** Ledger file - the edit suggester's own ledger, separate from the family's logs (volatile). */
	logFile: string;
	/** The master switch (volatile): false disables every listener to a passthrough. */
	enabled: boolean;
	/** The confidence gate (volatile); the pack's per-family thresholds (0.85 destructive) override per family. */
	threshold: number;
	/** The judged modification tools (volatile). */
	tools: string[];
	/** Maximum companions in one note (volatile). */
	maxCompanions: number;
	/** Hard character cap on the note text (volatile). */
	maxNoteChars: number;
	/** No second note for the same family within this many judged calls (volatile). */
	cooldownCalls: number;
	/** Maximum notes per turn, per agent (volatile). */
	maxNotesPerTurn: number;
	/** The excluded directories - an edit inside them never notes (volatile). */
	exclude: string[];
}
