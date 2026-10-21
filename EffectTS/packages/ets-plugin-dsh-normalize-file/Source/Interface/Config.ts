// Config - the validated plugin-config shape the loader hands to `apply`.
// Cordis validates the exported Schemastery schema while the plugin loads and
// fills every default (docs/user/develop/basic/config.md:45), so `apply`
// receives a plain object of exactly this shape. The schema that produces it
// lives in Variable/Config.ts; every field here is a config field (the
// cordis.yml test - no hardcoded tunables).
//
// VOLATILE CELLS: `log`, `logFile` and `replacement` are `.volatile()` in the
// schema - the loader hands them to apply as stable `{ get() }` references,
// and the FACTORY'S State builder unwraps them defensively (SCHEME.md §2.10),
// so this interface stays the plain shape. Hot edits to the volatile fields
// commit WITHOUT remounting the plugin. `replacement` is the dash step's only
// knob (a mid-session re-tune must not drop the tool registration). There is
// NO other field - the minimal block (`shared: false`) plus the two knobs is
// the whole config surface: the tool carries no fs/observed machinery and no
// stream flags, because it registers NO event listener at all (the family's
// first listener-less flavor).
export default interface Config {
	/** Ledger enabled - write the durable log file (volatile). */
	log: boolean;
	/** Ledger file - the file-flavor ledger, separate from the family's logs (volatile). */
	logFile: string;
	/** The dash replacement - ASCII hyphen-minus by default (volatile). */
	replacement: string;
	/** Granular scope gates (the whole object is volatile - one leaf change
	 *  commits one update whose whole object the State refreshes; only the
	 *  `files` scope is consumed by this flavor, the rest ride along so one
	 *  patch override drives the whole family). */
	scopes: Scopes;
	/** Tool-results exemption list (volatile): a result whose exec name is
	 *  listed passes the tools/post-execute arm by identity. */
	toolResultsExempt: string[];
}

/** The granular scope gates' shape (identical in all the family's flavors). */
export interface Scopes {
	/** The text-delta text and the assembled text/reasoning blocks. */
	conversation: boolean;
	/** The reasoning-delta sub-gate (ANDed with `normalizeReasoning`). */
	reasoning: boolean;
	/** The tool-call arguments arm (OR-ed with `normalizeToolArguments`). */
	toolInput: boolean;
	/** The tools/post-execute arm (tool results in the transcript). */
	toolResults: boolean;
	/** The normalize-file tool - the only scope this flavor consumes. */
	files: boolean;
	/** The agent/pre-step arm (the incoming step batch). */
	batch: boolean;
}
