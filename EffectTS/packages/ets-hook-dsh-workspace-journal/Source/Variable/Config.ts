// Config - the hook's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load,
// and `apply` receives a validated plain config object. The shape this schema
// produces is Interface/Config.ts.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
// a MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
// uses `shared: false` - the MINIMAL shared block, ONLY the two universal
// volatile cells (`log`, `logFile`). The hook's own `logFile` default (its
// SEPARATE ledger, one log per module) is supplied through its own fields,
// which override the minimal block's.
//
// VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
// commit WITHOUT remounting the plugin via the loader's loader/volatile-update
// event; the factory's State builder refreshes the mapped State fields IN
// PLACE, so a flip (enabled, domain, maxBatches, maxEntryBytes, exclude, ...)
// takes effect on the next call.
//
// `enabled` defaults to FALSE - the IDLE-forever posture: the plugin ships
// disabled, never appears in the profile's bundles, and enables only by an
// explicit ACTIVATE.
//
// This is one of the modules in the tree with a runtime import of
// @deepseek-ai/schemastery (the schema must be a real schemastery instance -
// the loader consumes it through the Standard Schema `~standard` interface).
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/ets-plugin-dsh-factory";

export default Compose(false, {
	logFile: Schema.string()
		.default("~/.dsh/playform/ets-hook-dsh-workspace-journal.log")
		.volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The KV domain name (the hook's own domain - the rollback layer's
	// per-batch records and revert data; a NEW domain, never an extension
	// record in the shared package_governance one).
	domain: Schema.string().default("workspace_journal").volatile(),
	// The ring bound: the last maxBatches batch records survive eviction.
	maxBatches: Schema.number().default(200).volatile(),
	// The pre-image size cap in bytes: a larger pre-image is recorded
	// truncated and its replay is skipped with a ledger line - never half-applied.
	maxEntryBytes: Schema.number().default(65536).volatile(),
	// The excluded path patterns (the factory's segment match). Default: the
	// family's standard triple.
	exclude: Schema.array(Schema.string())
		.default(["node_modules/**", "**/Target/**", "**/.git/**"])
		.volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist. The journal's ONE
	// gated action is the revert - it writes the pre-images back, so `write`
	// defaults to `approve` and a revert waits for the user (the documented
	// `revert held (<n> files) (policy write=approve)` line, zero writes).
	// Recording (open/seal/recover) is `record` = automatic.
	// read/index/record/suggest/message are automatic; write/commit/spawn
	// wait for approval. Volatile as one object; a resolved pack's `policy`
	// section overrides the defaults per action (the wiring is the next
	// refinement; the type already exists).
	policy: Policy(),
});
