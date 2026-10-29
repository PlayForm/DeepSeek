// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Every tunable is a field; the shape this schema
// produces is Interface/Config.ts.
//
// The class plugin (`export default class PassOn extends Service`) carries
// this schema as a static `Config` (the registry applies a plugin's standard
// schema to the config before the class is constructed). No volatile cells
// here: the class form has no factory State to hot-refresh, so a config edit
// reloads the plugin.
//
// `enabled` defaults to true once the plugin is ACTIVATED: the pass-on is
// READ-ONLY - it never writes a file (plan section 3), so its idle risk is
// nil; the write path lives entirely in the ingester.
import Schema from "@deepseek-ai/schemastery";
import { Policy } from "@playform/ets-plugin-dsh-factory";
import { DEFAULT_KINDS } from "@Variable/Kinds.js";

export default Schema.object({
	enabled: Schema.boolean().default(true),
	logFile: Schema.string().default("~/.dsh/playform/ets-plugin-dsh-pass-on.log"),
	root: Schema.string().default(process.cwd()),
	maxTargets: Schema.number().default(20),
	maxPreviewBytes: Schema.number().default(2048),
	expiresSeconds: Schema.number().default(3600),
	// The kind DICT is a plain (non-volatile) table: a configured dict
	// replaces the catalog wholesale.
	kinds: Schema.dict(
		Schema.object({
			globs: Schema.array(Schema.string()).default([]),
			param: Schema.string(),
		}),
	).default(DEFAULT_KINDS),
	// THE POLICY BLOCK (D6): the per-action allowlist, the shared factory
	// block composed into this schema. The pass-on is READ-ONLY - it reads
	// and proposes (`read`/`suggest`, both automatic) and never writes,
	// commits or spawns; those verdicts are declared for family uniformity and
	// stay the shipped `approve`. A resolved pack's `policy` section overrides
	// the defaults per action (the wiring is the next refinement).
	policy: Policy(),
});
