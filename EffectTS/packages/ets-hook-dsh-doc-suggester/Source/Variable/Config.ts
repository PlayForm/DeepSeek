// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load,
// and `apply` receives a validated plain config object.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
// a MODULE-LEVEL named export): the NON-MANIFEST posture uses `shared: false`
// - the MINIMAL shared block, ONLY the two universal volatile cells (`log`,
// `logFile`). The doc suggester hooks tools/post-execute, not fs/observed, so
// the schema never advertises updateCooldownMs/mutationTools/policyFile/
// exclude. The suggester's own `logFile` default (its SEPARATE ledger, one
// log per module) is supplied through its own fields.
//
// VOLATILE CELLS: every tuning knob is `.volatile()` - hot-editable without a
// remount, matching the tool-coach's posture. There is no structural knob:
// the pack is embedded data, not a file path.
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/ets-plugin-dsh-factory";

export default Compose(false, {
	// Ledger file - the doc suggester's ledger, SEPARATE from the family's
	// logs (one log per module) - volatile: hot-editable without remounting.
	logFile: Schema.string().default("~/.dsh/doc-suggester.log").volatile(),
	// The master switch (volatile): false mutes every listener to a passthrough.
	enabled: Schema.boolean().default(true).volatile(),
	// The confidence gate (volatile); the pack's per-family thresholds override.
	threshold: Schema.number().default(0.75).volatile(),
	// The judged doc-task tools (volatile): the read/search calls that touch
	// documentation plus the edits that land on it.
	tools: Schema.array(String)
		.default(["read", "grep", "glob", "write", "edit", "raw-write"])
		.volatile(),
	// Maximum companions in one note (volatile).
	maxCompanions: Schema.number().default(7).volatile(),
	// Hard character cap on the note text (volatile).
	maxNoteChars: Schema.number().default(1200).volatile(),
	// No second note for the same family within this many judged calls (volatile).
	cooldownCalls: Schema.number().default(6).volatile(),
	// Maximum notes per turn, per agent (volatile).
	maxNotesPerTurn: Schema.number().default(3).volatile(),
	// The excluded directories - a doc task inside them never notes (volatile).
	exclude: Schema.array(String).default(["node_modules", "Target", ".git", "dist"]).volatile(),
});
