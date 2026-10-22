// Config - the hook's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load.
// The shape this schema produces is Interface/Config.ts; the contract is
// MERGE.md.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
// a MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
// uses `shared: false` - the MINIMAL shared block, ONLY the two universal
// volatile cells (`log`, `logFile`).
//
// VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
// commit WITHOUT remounting the plugin.
//
// `enabled` defaults to FALSE - the IDLE-forever posture.
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";

export default Compose(false, {
	logFile: Schema.string().default("~/.dsh/merge.log").volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The KV domain name (the hook's own domain, NOT the shared
	// package_governance one - the hook owns its record schema).
	domain: Schema.string().default("workspace_merge").volatile(),
	// The atomicity mode: all-or-nothing (default) or survivors.
	mode: Schema.union(["all-or-nothing", "survivors"]).default("all-or-nothing").volatile(),
	// The batch gates.
	maxFiles: Schema.number().default(50).volatile(),
	maxTotalBytes: Schema.number().default(1000000).volatile(),
});
