// Config — the validated plugin-config shape the loader hands to `apply`.
// Cordis validates the exported Schemastery schema while the plugin loads and
// fills every default (docs/user/develop/basic/config.md:45), so `apply`
// receives a plain object of exactly this shape. The schema that produces it
// lives in Variable/Config.ts; every field here is a config field (the
// cordis.yml test — no hardcoded tunables).
//
// VOLATILE CELLS: `log` and `logFile` are `.volatile()` in the schema — the
// loader hands them to apply as stable `{ get() }` references, and the
// FACTORY'S State builder unwraps them defensively (SCHEME.md §2.10), so
// this interface stays the plain shape. Hot edits to the volatile fields
// commit WITHOUT remounting the plugin. There is NO `replacement` field —
// this is a MAP flavor: the substitution is the core's Fullwidth table, not
// a configured knob. `normalizeReasoning` and `normalizeToolArguments` are
// plain (remount on edit — they change the stream dispatch semantics).
export default interface Config {
	/** Ledger enabled — write the durable log file (volatile). */
	log: boolean;
	/** Ledger file — the fullwidth ledger, separate from the family's logs (volatile). */
	logFile: string;
	/** Normalize `reasoning-delta` chunks and the assembled ReasoningBlock too. */
	normalizeReasoning: boolean;
	/** IMPLEMENTED (default OFF): when on, the tool-call argumentsDelta and
	 *  the assembled ToolCallBlock.arguments are rewritten by the transform
	 *  too (execution-critical raw JSON — enabling it is the user's accepted
	 *  risk; this profile's patch yml enables it). */
	normalizeToolArguments: boolean;
}
