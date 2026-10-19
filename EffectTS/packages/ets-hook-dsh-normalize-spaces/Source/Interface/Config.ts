// Config — the validated plugin-config shape the loader hands to `apply`.
// Cordis validates the exported Schemastery schema while the plugin loads and
// fills every default (docs/user/develop/basic/config.md:45), so `apply`
// receives a plain object of exactly this shape. The schema that produces it
// lives in Variable/Config.ts; every field here is a config field (the
// cordis.yml test — no hardcoded tunables).
//
// VOLATILE CELLS: `log`, `logFile` and `replacement` are `.volatile()` in the
// schema — the loader hands them to apply as stable `{ get() }` references,
// and the FACTORY'S State builder unwraps them defensively (SCHEME.md
// §2.10), so this interface stays the plain shape. Hot edits to the volatile
// fields commit WITHOUT remounting the plugin. `replacement` is the
// transform's only knob; `normalizeReasoning` and `normalizeToolArguments`
// are plain (remount on edit — they change the stream dispatch semantics).
export default interface Config {
	/** Ledger enabled — write the durable log file (volatile). */
	log: boolean;
	/** Ledger file — the spaces ledger, separate from the family's logs (volatile). */
	logFile: string;
	/** The space replacement — the plain ASCII space by default (volatile). */
	replacement: string;
	/** Normalize `reasoning-delta` chunks and the assembled ReasoningBlock too. */
	normalizeReasoning: boolean;
	/** IMPLEMENTED (default OFF): when on, the tool-call argumentsDelta and
	 *  the assembled ToolCallBlock.arguments are rewritten by the transform
	 *  too (execution-critical raw JSON — enabling it is the user's accepted
	 *  risk; this profile's patch yml enables it). Deprecated in favor of
	 *  `scopes.toolInput`; kept and OR-ed in. */
	normalizeToolArguments: boolean;
	/** Granular scope gates (the whole object is volatile — one leaf change
	 *  commits one update whose whole object the State refreshes). */
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
	/** The normalize-file tool (inert in the stream flavors). */
	files: boolean;
	/** The agent/pre-step arm (the incoming step batch). */
	batch: boolean;
}
