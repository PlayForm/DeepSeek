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
// machinery the ellipsis hook has NONE of: it hooks llm/stream, not
// fs/observed, and shipping those dead fields would advertise behavior the
// plugin does not have. The ellipsis hook's own `logFile` default (its
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
	// Ledger file — the ellipsis ledger, SEPARATE from the family's logs
	// (one log per module) — volatile: hot-editable without remounting
	// (overrides the minimal shared block's empty default).
	logFile: Schema.string().default("~/.dsh/hook-dsh-normalize-ellipsis.log").volatile(),
	// The ellipsis replacement — the transform's ONLY knob. The ASCII
	// "..." three-dot sequence by default (the typographic ellipsis's own
	// ASCII spelling). Volatile: hot-editable; the next stream picks it up
	// with no remount.
	replacement: Schema.string().default("...").volatile(),
	// Normalize reasoning deltas and the assembled ReasoningBlock too (the
	// replacement applies to whatever the model wrote; the deltas AND the
	// block must agree, or consumers see inconsistencies).
	normalizeReasoning: Schema.boolean().default(true),
	// IMPLEMENTED (default OFF — the SCHEMA default stays off for
	// everyone): when on, the tool-call argumentsDelta and the assembled
	// ToolCallBlock.arguments are rewritten by the transform too. The
	// arguments are execution-critical raw JSON, so enabling it is the
	// user's accepted risk — this profile's cordis.patch.yml turns it on.
	normalizeToolArguments: Schema.boolean().default(false),
});
