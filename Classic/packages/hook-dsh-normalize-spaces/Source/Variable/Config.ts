// Config — the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default (docs/user/develop/basic/config.md:45), so
// invalid configuration fails LOUD at load instead of silently falling back
// per-field, and `apply` receives a validated plain config object. The shape
// this schema produces is Interface/Config.ts; every default below is the
// schema-level home of that shape's field values.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (factory v0.1.1, P1 —
// `Schema(shared?, module?)` as a MODULE-LEVEL named export): the NON-MANIFEST
// posture uses `shared: false` — the MINIMAL shared block, ONLY the two
// universal volatile cells (`log`, `logFile`). The factory's full shared
// block (updateCooldownMs, mutationTools, policyFile, exclude) is fs/observed
// machinery the spaces hook has NONE of: it hooks llm/stream, not
// fs/observed, and shipping those dead fields would advertise behavior the
// plugin does not have. The spaces hook's own `logFile` default (its
// SEPARATE ledger) is supplied through its own fields, which override the
// minimal block's.
//
// P8 — VOLATILE CELLS: `log`, `logFile` and `replacement` are `.volatile()`
// — hot edits commit WITHOUT remounting the plugin. `replacement` is the
// transform's only knob, so a mid-session re-tune must not drop the
// registration; the loader hands volatile fields to apply as stable
// references (`{ get() }` cells) and the factory's State builder unwraps
// them defensively. `normalizeReasoning` / `normalizeToolArguments` change
// the dispatch SEMANTICS, so they remount on edit (plain fields).
//
// This is the ONLY module in the tree with a runtime import of
// @deepseek-ai/schemastery (the schema must be a real schemastery instance —
// the loader consumes it through the Standard Schema `~standard` interface;
// the import resolves from the running dsh's own copy,
// docs/user/develop/basic/publish.md:103).
import { Schema as Compose } from "@playform/plugin-dsh-factory";
import Schema from "@deepseek-ai/schemastery";

export default Compose(false, {
	// Ledger file — the spaces ledger, SEPARATE from the family's logs (one
	// log per module) — volatile: hot-editable without remounting (overrides
	// the minimal shared block's empty default).
	logFile: Schema.string().default("~/.dsh/hook-dsh-normalize-spaces.log").volatile(),
	// The space replacement — the transform's ONLY knob. The plain ASCII
	// space (U+0020) by default. Volatile: hot-editable; the next stream
	// picks it up with no remount.
	replacement: Schema.string().default(" ").volatile(),
	// Normalize reasoning deltas and the assembled ReasoningBlock too (the
	// replacement applies to whatever the model wrote; the deltas AND the
	// block must agree, or consumers see inconsistencies).
	normalizeReasoning: Schema.boolean().default(true),
	// IMPLEMENTED (default OFF — the SCHEMA default stays off for
	// everyone): when on, the tool-call argumentsDelta and the assembled
	// ToolCallBlock.arguments are rewritten by the transform too. The
	// arguments are execution-critical raw JSON, so enabling it is the
	// user's accepted risk — this profile's cordis.patch.yml turns it on.
	// DEPRECATED in favor of `scopes.toolInput`: kept and OR-ed in (effective
	// toolInput = this field || scopes.toolInput) so every existing profile
	// keeps working; new configs should use the scope gate.
	normalizeToolArguments: Schema.boolean().default(false),
	// Granular scope gates — ALL volatile (live toggling, no remount):
	// conversation=text/block-end, reasoning=its sub-gate, toolInput=tool-call
	// arguments arm, toolResults=tools/post-execute arm, files=the
	// normalize-file tool (inert in stream flavors so one patch override drives
	// the whole family), batch=agent/pre-step arm. The OBJECT carries the
	// volatile marker (its leaves stay plain — schemastery rejects volatile
	// leaves under an enclosing volatile field): one leaf change commits one
	// update whose whole object the State's refresh listener re-reads.
	scopes: Schema.object({
		conversation: Schema.boolean().default(true),
		reasoning: Schema.boolean().default(true),
		toolInput: Schema.boolean().default(false),
		toolResults: Schema.boolean().default(false),
		files: Schema.boolean().default(true),
		batch: Schema.boolean().default(false),
	}).volatile(),
	// Tool-results exemption list (the name-exempt precedent of the core's
	// stream gate, made configurable): a tool result whose exec name is listed
	// passes through by identity — read/edit are byte-contracted, raw-write/
	// normalize-file own their normalization, ccr_retrieve's bytes are the
	// retrieval contract, subagent/ask_user_question carry prompt material
	// matched verbatim.
	toolResultsExempt: Schema.array(Schema.string())
		.default([
			"read",
			"edit",
			"raw-write",
			"normalize-file",
			"ccr_retrieve",
			"subagent",
			"ask_user_question",
		])
		.volatile(),
});
