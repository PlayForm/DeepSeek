// Config - the validated plugin-config shape the loader hands to `apply`.
// Cordis validates the exported Schemastery schema while the plugin loads and
// fills every default, so `apply` receives a plain object of exactly this
// shape. The schema that produces it lives in Variable/Config.ts; every field
// here is a config field (the cordis.yml test - no hardcoded tunables).
//
// VOLATILE CELLS: `log`, `logFile`, plus every tuning knob of the
// hot-editable posture (`enabled`, `threshold`, `tools`, `maxCompanions`,
// `maxNoteChars`, `cooldownCalls`, `maxNotesPerTurn`, `exclude`, `learn`,
// `learnWindow`, `heuristics`, `weights`, `storeLimit`) are `.volatile()` in
// the schema - hot edits commit WITHOUT remounting the plugin.
export default interface Config {
	/** Ledger enabled - write the durable log file (volatile). */
	log: boolean;
	/** Ledger file - the doc suggester's own ledger, separate from the family's logs (volatile). */
	logFile: string;
	/** The master switch (volatile): false disables every listener to a passthrough. */
	enabled: boolean;
	/** The confidence gate (volatile); the pack's per-family thresholds override per family. */
	threshold: number;
	/** The judged doc-task tools (volatile). */
	tools: string[];
	/** Maximum companions in one note (volatile). */
	maxCompanions: number;
	/** Hard character cap on the note text (volatile). */
	maxNoteChars: number;
	/** No second note for the same family within this many judged calls (volatile). */
	cooldownCalls: number;
	/** Maximum notes per turn, per agent (volatile). */
	maxNotesPerTurn: number;
	/** The excluded directories - a doc task inside them never notes (volatile). */
	exclude: string[];
	/** The learning layer's master switch (volatile): false is the pure PoC posture. */
	learn: boolean;
	/** The follow-through window in judged calls (volatile; no timers). */
	learnWindow: number;
	/** The enabled pickable heuristics (volatile); a name left out is dropped from the score. */
	heuristics: string[];
	/** The pickable weight table (volatile); a missing name falls back to the default. */
	weights: Record<string, number>;
	/** The in-memory fallback's bound (volatile). */
	storeLimit: number;
}
