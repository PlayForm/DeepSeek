// Config - the hook's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load,
// and `apply` receives a validated plain config object. The shape this schema
// produces is Interface/Config.ts.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
// a MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
// uses `shared: false` - the MINIMAL shared block, ONLY the two universal
// volatile cells (`log`, `logFile`).
//
// VOLATILE CELLS: every knob in this schema is `.volatile()`.
//
// `enabled` defaults to FALSE - the IDLE-forever posture.
//
// This is one of the modules in the tree with a runtime import of
// @deepseek-ai/schemastery (the schema must be a real schemastery instance -
// the loader consumes it through the Standard Schema `~standard` interface).
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/plugin-dsh-factory";

export default Compose(false, {
	logFile: Schema.string().default("~/.dsh/playform/hook-dsh-workspace-audit.log").volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The KV domain name (the hook's own domain - the accountability
	// records; a NEW domain, never an extension record in the shared
	// package_governance one).
	domain: Schema.string().default("workspace_audit").volatile(),
	// The ring bound: the last maxLines audit lines survive in the meta record.
	maxLines: Schema.number().default(2000).volatile(),
	// The excluded path patterns (the factory's segment match). Default: the
	// family's standard triple.
	exclude: Schema.array(Schema.string())
		.default(["node_modules/**", "**/Target/**", "**/.git/**"])
		.volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist. This hook's action
	// class is RECORD - every line and every assessment is recorded - and it
	// is AUTOMATIC, so this package has NO gated action: it never writes a
	// file, commits a batch or spawns an agent, and no verdict can refuse it.
	// read/index/record/suggest/message are automatic; write/commit/spawn
	// wait for approval for the family's write paths. Volatile as one object;
	// a resolved pack's `policy` section overrides the defaults per action
	// (the wiring is the next refinement; the type already exists).
	policy: Policy(),
});
