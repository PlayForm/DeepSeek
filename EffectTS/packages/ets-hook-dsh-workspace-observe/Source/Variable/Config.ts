// Config - the hook's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load,
// and `apply` receives a validated plain config object. The shape this schema
// produces is Interface/Config.ts; the contract is WAVE-1-BRIEF.md section 5.6.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
// MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
// uses `shared: false` - the MINIMAL shared block, ONLY the two universal
// volatile cells (`log`, `logFile`). The hook's own `logFile` default (its
// SEPARATE ledger, one log per module) is supplied through its own fields,
// which override the minimal block's.
//
// VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
// commit WITHOUT remounting the plugin via the loader's loader/volatile-update
// event; the factory's State builder refreshes the mapped State fields IN
// PLACE, so a flip (enabled, domain, maxStamps, include, exclude, ...) takes
// effect on the next event.
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
		.default("~/.dsh/playform/ets-hook-dsh-workspace-observe.log")
		.volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The KV domain name (the hook's own domain, NOT the shared
	// package_governance one - a new domain name has no collision and the
	// hook owns its record schema).
	domain: Schema.string().default("workspace_observe").volatile(),
	// The ring bound: the last maxStamps stamps survive in the meta record.
	maxStamps: Schema.number().default(1000).volatile(),
	// The optional allowlist. Default EMPTY - every path records; a non-empty
	// list restricts recording to matching paths (reason `not included`).
	include: Schema.array(Schema.string()).default([]).volatile(),
	// The excluded path patterns (the hook's own match, Function/Match - the
	// shared Default list is the factory's segment list; the brief's default
	// is the glob triple, which the hook's matcher understands).
	exclude: Schema.array(Schema.string())
		.default(["node_modules/**", "**/Target/**", "**/.git/**"])
		.volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist. The hook's action class
	// is RECORD - it records an observation stamp on every fs/observed event -
	// and that class is AUTOMATIC, so this package has NO gated action: it
	// never writes a file, commits a batch or spawns an agent, and no verdict
	// can refuse it. read/index/record/suggest/message are automatic;
	// write/commit/spawn wait for approval for the family's write paths.
	// Volatile as one object; a resolved pack's `policy` section overrides the
	// defaults per action (the wiring is the next refinement; the type already
	// exists).
	policy: Policy(),
});
