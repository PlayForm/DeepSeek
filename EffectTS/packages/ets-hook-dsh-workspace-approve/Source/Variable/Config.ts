// Config - the hook's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load,
// and `apply` receives a validated plain config object. The shape this schema
// produces is Interface/Config.ts; the contract is
// Documentation/Plans/Workspace-Family/APPROVE.md.
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
// PLACE, so a flip (enabled, domain, maxBindings, requireConstraints, ...)
// takes effect on the next call or event.
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
		.default("~/.dsh/playform/ets-hook-dsh-workspace-approve.log")
		.volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The KV domain name (the hook's OWN domain - a new domain name has no
	// collision and the hook owns its record schema).
	domain: Schema.string().default("workspace_approve").volatile(),
	// The bound-ring capacity: the last maxBindings bindings survive in the
	// meta record (the eviction disposition `evict`, applied FIFO on the
	// ring - never silently, the drop is ledgered).
	maxBindings: Schema.number().default(1000).volatile(),
	// The constraint law: when true (the default), a bind request without at
	// least one constraint is rejected - the constraints travel with the
	// approval, so an approval without a stated constraint set is not an
	// approval.
	requireConstraints: Schema.boolean().default(true).volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist. This hook's action
	// class is RECORD - every service call records a binding (or a decision
	// about one) - and it is AUTOMATIC, so this package has NO gated action:
	// it never writes a file, commits a batch or spawns an agent, and no
	// verdict can refuse it. read/index/record/suggest/message are automatic;
	// write/commit/spawn wait for approval for the family's write paths.
	// Volatile as one object; a resolved pack's `policy` section overrides
	// the defaults per action (the wiring is the next refinement; the type
	// already exists).
	policy: Policy(),
});
