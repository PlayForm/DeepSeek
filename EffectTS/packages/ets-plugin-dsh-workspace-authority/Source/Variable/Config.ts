// Config - the service's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load,
// and `apply` receives a validated plain config object. The shape this schema
// produces is Interface/Config.ts; the contract is AUTHORITY.md +
// WORKSPACE-FAMILY-V4-1.md section 3.9.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
// a MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
// uses `shared: false` - the MINIMAL shared block, ONLY the two universal
// volatile cells (`log`, `logFile`).
//
// VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
// commit WITHOUT remounting the plugin; the factory's State builder refreshes
// the mapped State fields IN PLACE, so a policy edit lands on the next
// eviction pass and a TTL change on the next lease.
//
// `enabled` defaults to FALSE - the IDLE-forever posture: the service
// registers and reads honestly, but grants and leases nothing until enabled.
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/ets-plugin-dsh-factory";

export default Compose(false, {
	logFile: Schema.string()
		.default("~/.dsh/playform/ets-plugin-dsh-workspace-authority.log")
		.volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The default lease TTL (ms).
	defaultTtlMs: Schema.number().default(300_000).volatile(),
	// The lease ceiling per holder.
	maxLeasesPerHolder: Schema.number().default(8).volatile(),
	// The capability ceiling per holder.
	maxCapabilitiesPerHolder: Schema.number().default(16).volatile(),
	// The revocation grace (ms): how long a revoked capability still shields
	// its resource's promote protection (the policy's revocation timing).
	revocationGraceMs: Schema.number().default(0).volatile(),
	// The policy table: rules per resource kind; the first match wins.
	policy: Schema.array(
		Schema.object({
			kind: Schema.string().required(),
			disposition: Schema.string().default("keep"),
			ttlMs: Schema.number(),
			maxResidencyMs: Schema.number(),
			revocationGraceMs: Schema.number(),
		}),
	)
		.default([])
		.volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist, the shared factory
	// block. The key is `automation`, NOT `policy` - this package's `policy`
	// is already the RESIDENCY RULE TABLE above (kind -> disposition), a
	// different contract (the plugin-dsh-route precedent). This package's
	// action classes are read-only and record - the capability/lease/
	// residency records, the eviction dispositions and the read surface are
	// AUTOMATIC, so it has NO gated action: it never writes a file, commits a
	// batch or spawns an agent, and no verdict can refuse it.
	// read/index/record/suggest/message are automatic; write/commit/spawn
	// wait for approval for the family's write paths (declared here for
	// uniformity - this package never takes them). Volatile as one object; a
	// resolved pack's `policy` section overrides the defaults per action (the
	// wiring is the next refinement; the type already exists).
	automation: Policy(),
});
