// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load
// instead of silently falling back per-field, and `apply` receives a
// validated plain config object. The shape this schema produces is
// Interface/Config.ts.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
// a MODULE-LEVEL named export, imported as Compose): the tool-primary plugin
// is a NON-MANIFEST module (no fs/observed exclusion machinery), so
// `shared: false` - the MINIMAL shared block, ONLY the two universal volatile
// cells (`log`, `logFile`). The plugin's own `logFile` default (its SEPARATE
// ledger, one log per module) is supplied through its own fields.
//
// VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
// commit WITHOUT remounting the plugin; the factory's State builder refreshes
// the mapped State fields IN PLACE, so a flip (enabled, machinesPerAgent,
// opsPerCommit, deadlineMs, strictMode, interceptBash, monitorChecksets)
// lands on the next tool call without a remount.
//
// `enabled` defaults to FALSE - the IDLE-forever posture: the plugin ships
// disabled, never appears in the profile's bundles, and enables only by an
// explicit ACTIVATE.
//
// The runtime import of @deepseek-ai/schemastery (the schema must be a real
// schemastery instance - the loader consumes it through the Standard Schema
// `~standard` interface).
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/ets-plugin-dsh-factory";

export default Compose(false, {
	logFile: Schema.string().default("~/.dsh/batch-edit.log").volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The per-agent machine capacity (the planted-board lease semantics).
	machinesPerAgent: Schema.number().default(2).volatile(),
	// The op-line cap per commit; larger batches use the opfile path (the
	// [live-report] ingest precedent, no schema limit).
	opsPerCommit: Schema.number().default(64).volatile(),
	// The in-line deadline, capped at 120000 (the composition contract); the
	// schema accepts 1000..120000 and validation fails loud outside it.
	deadlineMs: Schema.number().default(120000).volatile(),
	// Search-not-found: error the file (true) or skip the op (false).
	strictMode: Schema.boolean().default(false).volatile(),
	// The advisory bash intercept: OFF in v1 (never denies; enforcement
	// stays out of scope for this plugin).
	interceptBash: Schema.boolean().default(false).volatile(),
	// Per-file check-set names (the live containers' monitor vocabulary,
	// reused as labels in v1).
	monitorChecksets: Schema.array(Schema.string()).default([]).volatile(),
});
