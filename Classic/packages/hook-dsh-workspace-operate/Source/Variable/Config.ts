// Config - the hook's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load,
// and `apply` receives a validated plain config object. The shape this schema
// produces is Interface/Config.ts; the contract is OPERATE.md (the
// distribution law: the hook's own Config, ledger strings, and tools).
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
// a MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
// uses `shared: false` - the MINIMAL shared block, ONLY the two universal
// volatile cells (`log`, `logFile`). The hook's own `logFile` default (its
// SEPARATE ledger, one log per module) is supplied through its own fields.
//
// VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
// commit WITHOUT remounting the plugin.
//
// `enabled` defaults to FALSE - the IDLE-forever posture.
//
// This is one of the modules in the tree with a runtime import of
// @deepseek-ai/schemastery (the schema must be a real schemastery instance).
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";

export default Compose(false, {
	logFile: Schema.string().default("~/.dsh/operate.log").volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The KV domain name (the hook's own domain, NOT the shared
	// package_governance one - the hook owns its record schema).
	domain: Schema.string().default("workspace_operate").volatile(),
	// The live proposal table bound: a pass is refused when full.
	maxProposals: Schema.number().default(500).volatile(),
	// The list limits (the graph's rule: default, capped at maximum).
	limitDefault: Schema.number().default(50).volatile(),
	limitMaximum: Schema.number().default(500).volatile(),
});
