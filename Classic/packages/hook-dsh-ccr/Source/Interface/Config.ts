// Config - the validated plugin-config shape the loader hands to `apply`.
// Cordis validates the exported Schemastery schema while the plugin loads and
// fills every default (docs/user/develop/basic/config.md:45), so `apply`
// receives a plain object of exactly this shape. The schema that produces it
// lives in Variable/Config.ts (the plan's §5 schema, verbatim); every field
// here is a config field (the cordis.yml test - no hardcoded tunables).
//
// VOLATILE CELLS: `log`, `logFile` (the shared universal cells), plus
// `thresholdBytes`, `previewMaxChars` and `multipliers` are `.volatile()` in
// the schema - the loader hands them to apply as stable `{ get() }`
// references, and the FACTORY'S State builder unwraps them defensively, so
// this interface stays the plain shape. Hot edits to the volatile fields
// commit WITHOUT remounting the plugin - matching Aphrodite's hot-reload
// thresholds. Structural knobs (targets, exempt, store, journal, auto-expand,
// the context-engine phase-4 flags) are plain (remount on edit).
export default interface Config {
	/** Ledger enabled - write the durable log file (volatile). */
	log: boolean;
	/** Ledger file - the CCR hook's own ledger, separate from the family's logs (volatile). */
	logFile: string;
	/** The target allow-list: tools whose oversized results are compressed. */
	targets: string[];
	/** The exemption list: tools that are NEVER compressed (execution-critical mutators, the plugin's own retrieval tool, other agents' briefs and user gates). */
	exempt: string[];
	/** The one byte gate for all tools (volatile). */
	thresholdBytes: number;
	/** Results at or below this size are inlined in the store and previewed fully (Aphrodite's inline_threshold). */
	inlineThresholdBytes: number;
	/** Store + preview but return FULL content while under autoExpandLimitBytes - no marker reaches the model. */
	autoExpand: boolean;
	/** The auto-expand ceiling (bytes); above it the preview + marker replacement kicks in. */
	autoExpandLimitBytes: number;
	/** Compress failing results too (default off; the error ×8 tier is the only beneficiary). */
	compressFailures: boolean;
	/** Per-type multiplier on the byte gate (volatile; errors compress late, grep/paths/web early). */
	multipliers: {
		terminal: number;
		error: number;
		grep: number;
		paths: number;
		file: number;
		json: number;
		web: number;
		default: number;
	};
	/** Hard character cap on every preview line (volatile). */
	previewMaxChars: number;
	/** Store TTL in seconds; entries at or past ttlAt are evicted on access/insert. */
	ttlSeconds: number;
	/** The LRU budget in bytes (default 256 MiB, Aphrodite's inline store). */
	storeBudgetBytes: number;
	/** Optional JSONL disk journal; empty (the default) = memory-only. */
	journalPath: string;
	/** Phase-4 context engine (middle-turn archiving); parsed but inert in the MVP. */
	contextEngine: boolean;
	/** Phase-4: the context-usage percent that starts archiving (parsed only). */
	contextEngineThresholdPct: number;
	/** Phase-4: turns protected from archiving at the head (parsed only). */
	protectFirstTurns: number;
	/** Phase-4: turns protected from archiving at the tail (parsed only). */
	protectLastTurns: number;
}
