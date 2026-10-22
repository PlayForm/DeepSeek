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
	limitDefault: Schema.number().default(50).volatile(),
	limitMaximum: Schema.number().default(500).volatile(),
});
