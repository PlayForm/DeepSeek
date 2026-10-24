// Config - the service's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load,
// and `apply` receives a validated plain config object. The shape this schema
// produces is Interface/Config.ts; the contract is EVIDENCE.md (the
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
// PLACE, so a flip (enabled, domain, maxValidations, exclude) takes effect on
// the next validate or event.
//
// `enabled` defaults to FALSE - the IDLE-forever posture: the service ships
// disabled, never appears in the profile's bundles, and enables only by an
// explicit ACTIVATE.
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/plugin-dsh-factory";

export default Compose(false, {
	logFile: Schema.string()
		.default("~/.dsh/playform/plugin-dsh-workspace-evidence.log")
		.volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The KV domain name (the service's own domain, not a shared one).
	domain: Schema.string().default("workspace_evidence").volatile(),
	// The store bound: the last maxValidations validation objects survive
	// (in memory and in the domain's validations table).
	maxValidations: Schema.number().default(512).volatile(),
	// The excluded path patterns (the factory's segment match; an fs/observed
	// event for a matched segment triggers no invalidation). Default matches
	// the shared built-in list the observe hook ships (SEGMENT names, not
	// globs - the factory's Function/Match is a segment matcher).
	exclude: Schema.array(Schema.string()).default(["node_modules", "Target", ".git"]).volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist. This package's action
	// classes are read-only and record - the validation objects, the stale
	// invalidation and the read surface are AUTOMATIC, so this package has NO
	// gated action: it never writes a file, commits a batch or spawns an
	// agent, and no verdict can refuse it. read/index/record/suggest/message
	// are automatic; write/commit/spawn wait for approval for the family's
	// write paths (declared here for uniformity - this package never takes
	// them). Volatile as one object; a resolved pack's `policy` section
	// overrides the defaults per action (the wiring is the next refinement;
	// the type already exists).
	policy: Policy(),
});
