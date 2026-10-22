// Config - the service's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load,
// and `apply` receives a validated plain config object. The shape this schema
// produces is Interface/Config.ts; the contract is SEMANTICS.md (the
// distribution law: its own Config + ledger strings).
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
// MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
// uses `shared: false` - the MINIMAL shared block, ONLY the two universal
// volatile cells (`log`, `logFile`). The service's own `logFile` default (its
// SEPARATE ledger, one log per module) is supplied through its own fields,
// which override the minimal block's.
//
// VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
// commit WITHOUT remounting the plugin via the loader's loader/volatile-update
// event; the factory's State builder refreshes the mapped State fields IN
// PLACE, so a flip (enabled, domain, maxEntries, exclude) takes effect on the
// next resolve or event.
//
// `enabled` defaults to FALSE - the IDLE-forever posture: the service ships
// disabled, never appears in the profile's bundles, and enables only by an
// explicit ACTIVATE.
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";

export default Compose(false, {
	logFile: Schema.string().default("~/.dsh/semantics.log").volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The KV domain name (the service's own domain, not a shared one).
	domain: Schema.string().default("workspace_semantics").volatile(),
	// The index bound: the last maxEntries built models survive in memory
	// (and in the domain's models table).
	maxEntries: Schema.number().default(256).volatile(),
	// The excluded path patterns (the factory's segment match; the default is
	// the same glob triple the observe hook ships).
	exclude: Schema.array(Schema.string())
		.default(["node_modules/**", "**/Target/**", "**/.git/**"])
		.volatile(),
});
