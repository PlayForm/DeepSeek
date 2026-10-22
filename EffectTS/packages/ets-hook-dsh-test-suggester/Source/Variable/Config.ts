// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load
// instead of silently falling back per-field, and `apply` receives a
// validated plain config object. The shape this schema produces is
// Interface/Config.ts.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
// a MODULE-LEVEL named export): the NON-MANIFEST posture uses `shared: false`
// - the MINIMAL shared block, ONLY the two universal volatile cells (`log`,
// `logFile`). The hook hooks tools/post-execute, not fs/observed, so the
// schema never advertises the factory's fs machinery. The hook's own
// `logFile` default (its SEPARATE ledger, one log per module) is supplied
// through its own fields, which override the minimal block's.
//
// EVERY knob is volatile (hot-editable without remounting), matching the
// search plan's §4.8 posture - the noise-control knobs need mid-session
// retuning without a rebuild.
//
// Runtime import of @deepseek-ai/schemastery (the schema must be a real
// schemastery instance - the loader consumes it through the Standard Schema
// `~standard` interface; the import resolves from the running dsh's own
// copy, docs/user/develop/basic/publish.md:103).
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/ets-plugin-dsh-factory";

export default Compose(false, {
	// Ledger file - the hook's own ledger, SEPARATE from the family's logs (one
	// log per module) - volatile: hot-editable without remounting.
	logFile: Schema.string().default("~/.dsh/test-suggester.log").volatile(),
	// Master switch (volatile: the kill-criterion flip is a hot edit).
	enabled: Schema.boolean().default(true).volatile(),
	// The default confidence gate (volatile). The pack's per-intent thresholds
	// may raise it; they may never lower it (the gate is max of the two).
	threshold: Schema.number().default(0.75).volatile(),
	// Maximum candidates in one note (volatile).
	maxCandidates: Schema.number().default(7).volatile(),
	// Hard character cap on the note text (volatile).
	maxNoteChars: Schema.number().default(1200).volatile(),
	// No second note for the same intent within this many judged calls (volatile).
	cooldownCalls: Schema.number().default(6).volatile(),
	// Maximum notes per agent turn (volatile).
	maxNotesPerTurn: Schema.number().default(3).volatile(),
	// The enabled intent ids (volatile). Empty = all pack intents enabled.
	intents: Schema.array(String).default([]).volatile(),
	// The judged tool names - the search-class family plus the edit family
	// (the plan's emitOn, §4.8). Structural semantics, volatile anyway.
	emitOn: Schema.array(String).default(["bash", "glob", "grep", "read"]).volatile(),
	// Path prefixes a candidate is never drawn from (volatile).
	exclude: Schema.array(String).default(["node_modules", "Target", ".git", "dist"]).volatile(),
});
