// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load,
// and `apply` receives a validated plain config object. The shape this schema
// produces is Interface/Config.ts; the contract is
// Documentation/Plans/Workspace-Family/REFLECT.md.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
// MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
// uses `shared: false` - the MINIMAL shared block, ONLY the two universal
// volatile cells (`log`, `logFile`). The plugin's own `logFile` default (its
// SEPARATE ledger, one log per module) is supplied through its own fields,
// which override the minimal block's.
//
// VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
// commit WITHOUT remounting the plugin via the loader's loader/volatile-update
// event; the factory's State builder refreshes the mapped State fields IN
// PLACE, so a flip (enabled, propagate, maxFileBytes, maxBlockLines) takes
// effect on the next operation.
//
// `enabled` defaults to FALSE - the IDLE-forever posture: the plugin ships
// disabled, never appears in the profile's bundles, and enables only by an
// explicit ACTIVATE.
//
// This is one of the modules in the tree with a runtime import of
// @deepseek-ai/schemastery (the schema must be a real schemastery instance -
// the loader consumes it through the Standard Schema `~standard` interface).
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/ets-plugin-dsh-factory";

export default Compose(false, {
	logFile: Schema.string().default("~/.dsh/reflect.log").volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The default rename scope: "block" renames inside the operation's span
	// only; "file" renames whole-word across the whole file (the one-call
	// bundling of the affected references). The operation's own `scope`
	// field overrides this default.
	propagate: Schema.union(["block", "file"]).default("block").volatile(),
	// Files larger than this are refused (`rejected <path> (file too large)`)
	// - the operation reads the whole file into memory to transform it.
	maxFileBytes: Schema.number().default(1000000).volatile(),
	// A replace/rename span wider than this many lines is refused
	// (`rejected <path> (span too large)`) - the span guard against a
	// whole-file replacement smuggled in as a "block" operation.
	maxBlockLines: Schema.number().default(5000).volatile(),
});
