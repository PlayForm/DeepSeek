// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load
// instead of silently falling back per-field. The shape this schema produces
// is Interface/Config.ts; every field is one of the brief's frozen config
// rows (section 4.5, all volatile) and NOTHING else - no hidden knobs.
//
// VOLATILE CELLS: every field is `.volatile()` - a hot edit commits into the
// running fiber without remounting; the service's constructor unwraps the
// cells once at load (Function/Unwrap) and the fail-loud validation
// (Function/Validate) runs on the plain values.
//
// `enabled` defaults to FALSE - the IDLE-FOREVER posture: the plugin ships
// disabled, never appears in the profile's bundles, and enables only by an
// explicit ACTIVATE.
//
// The schema is a real @deepseek-ai/schemastery instance - the loader
// consumes it through the Standard Schema `~standard` interface.
import Schema from "@deepseek-ai/schemastery";
import { Policy } from "@playform/plugin-dsh-factory";
import DEFAULT_EXCLUDE from "@Variable/Default.js";

export default Schema.object({
	enabled: Schema.boolean().default(false).volatile(),
	domain: Schema.string().default("workspace_graph").volatile(),
	languages: Schema.array(Schema.union(["typescript", "javascript", "markdown"]))
		.default(["typescript", "javascript", "markdown"])
		.volatile(),
	include: Schema.array(Schema.string()).default([]).volatile(),
	exclude: Schema.array(Schema.string()).default(DEFAULT_EXCLUDE).volatile(),
	maxFileBytes: Schema.number().default(1000000).volatile(),
	maxNodesPerFile: Schema.number().default(5000).volatile(),
	// The `indexWorkspace` walk bound (the one field the indexing trigger
	// added to the brief's table): the walk stops after this many candidate
	// files, so a call on a large tree is bounded work. A caller's explicit
	// `maxFiles` option overrides it for that call.
	maxFiles: Schema.number().default(2000).volatile(),
	limitDefault: Schema.number().default(50).volatile(),
	limitMaximum: Schema.number().default(500).volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist. The graph's actions are
	// INDEX (automatic), so this package has NO gated action: it never writes a
	// file, commits a batch or spawns an agent, and no verdict can refuse it.
	// read/index/record/suggest/message are automatic; write/commit/spawn wait
	// for approval for the family's write paths. Volatile as one object; a
	// resolved pack's `policy` section overrides the defaults per action (the
	// wiring is the next refinement; the type already exists).
	policy: Policy(),
});
