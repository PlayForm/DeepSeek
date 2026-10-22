// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load
// instead of silently falling back per-field, and `apply` receives a
// validated plain config object. The shape this schema produces is
// Interface/Config.ts.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
// a MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
// uses `shared: false` - the MINIMAL shared block, ONLY the two universal
// volatile cells (`log`, `logFile`), with the plugin's own `logFile` default
// (its SEPARATE ledger, one log per module) supplied through its own fields,
// which override the minimal block's.
//
// VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
// commit WITHOUT remounting the plugin via the loader's loader/volatile-update
// event; the factory's State builder refreshes the mapped State fields IN
// PLACE, so a flip (enabled, mapDepth, findLimit, packetTokenBudget, ...)
// takes effect on the next tool call.
//
// `enabled` defaults to FALSE - the IDLE-forever posture: the plugin ships
// disabled, never appears in the profile's bundles, and enables only by an
// explicit ACTIVATE.
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";

export default Compose(false, {
	logFile: Schema.string().default("~/.dsh/workspace.log").volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The workspace_map knobs (V4-1 §3.4: the top-level modules, depth).
	mapDepth: Schema.number().default(2).volatile(),
	mapMaxModules: Schema.number().default(20).volatile(),
	// The workspace_find knobs (the limits match the graph service's own
	// contract defaults: limitDefault 50, limitMaximum 500, W1 §4.5).
	findLimit: Schema.number().default(50).volatile(),
	findLimitMax: Schema.number().default(500).volatile(),
	// The workspace_expand knobs (the graph caps depth at 3, W1 §4.3).
	expandDepth: Schema.number().default(1).volatile(),
	expandMaxNeighbors: Schema.number().default(50).volatile(),
	// The workspace_context packet budget (V4-1 §3.5: target 2k tokens, the
	// hard cap configurable). No token counter is injected in v0 - the budget
	// is enforced through the characters-per-token estimate, honest and
	// documented in the SCHEME.
	packetTokenBudget: Schema.number().default(2000).volatile(),
	packetTokenMax: Schema.number().default(4000).volatile(),
	tokenCharsPerToken: Schema.number().default(4).volatile(),
	// The node kinds filter (empty = all kinds).
	kinds: Schema.array(Schema.union(["File", "Symbol", "Block", "Test", "DocSection"]))
		.default([])
		.volatile(),
});
