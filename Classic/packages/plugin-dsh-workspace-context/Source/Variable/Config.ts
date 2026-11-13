import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/plugin-dsh-factory";
import DefaultLens from "@Variable/DefaultLens.js";

/**
 * @module Config
 *
 * The service's Schemastery Config schema (a Variable: one constant built
 * once at load).
 *
 * @remarks
 *
 * Cordis validates the exported schema while the plugin loads and fills
 * every default, so invalid configuration fails LOUD at load, and `apply`
 * receives a validated plain config object. The shape this schema produces
 * is Interface/Config.ts; the contract is
 * Documentation/Plans/WORKSPACE-FAMILY-V4-1.md section 3.5.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
 * a MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST
 * posture uses `shared: false` - the MINIMAL shared block, ONLY the two
 * universal volatile cells (`log`, `logFile`). The service's own `logFile`
 * default (its SEPARATE ledger, one log per module) is supplied through its
 * own fields, which override the minimal block's.
 *
 * VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
 * commit WITHOUT remounting the plugin; the factory's State builder
 * refreshes the mapped State fields IN PLACE.
 *
 * `enabled` defaults to FALSE - the IDLE-forever posture.
 */
const DefaultEnabled = true;
const DefaultLog = true;
const DefaultLogFile = "~/.dsh/playform/plugin-dsh-workspace-context.log";
// The budget: target 2k tokens (V4-1 section 3.5), hard cap configurable.
const DefaultBudgetTokens = 2000;
const DefaultBudgetMaximum = 4000;
const DefaultLensDefault = "code";
// The packet shape caps.
const DefaultNeighborLimit = 20;
const DefaultEvidenceLimit = 12;
const DefaultMapLimit = 12;
// The workspace header name.
const DefaultWorkspaceName = "workspace";

export default Compose(false, {
	// The MASTER SWITCH (volatile: a flip is read on the very next call): false =
	// the cold mount logs `disabled (enabled=false)` and every surface - the
	// service, the trace adapter and the tool - still registers, answering at
	// call time (the tool refuses; the listener does nothing). Distinct from
	// the shared `log` cell, which governs only the durable ledger file.
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	// Ledger enabled - write the durable log file (volatile).
	log: Schema.boolean().default(DefaultLog).volatile(),
	// Ledger file - the service's SEPARATE ledger, one log per module -
	// volatile: hot-editable without remounting (overrides the minimal
	// shared block's empty default).
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	budgetTokens: Schema.number().default(DefaultBudgetTokens).volatile(),
	budgetMaximum: Schema.number().default(DefaultBudgetMaximum).volatile(),
	// The lenses: the catalog names the packet can be built through; the
	// default is the full shipped catalog.
	lenses: Schema.array(Schema.string())
		.default(DefaultLens.map((Lens) => Lens.name))
		.volatile(),
	// The lens used when the caller names none.
	lensDefault: Schema.string().default(DefaultLensDefault).volatile(),
	// The packet shape caps.
	neighborLimit: Schema.number().default(DefaultNeighborLimit).volatile(),
	evidenceLimit: Schema.number().default(DefaultEvidenceLimit).volatile(),
	mapLimit: Schema.number().default(DefaultMapLimit).volatile(),
	// The workspace header name.
	workspaceName: Schema.string().default(DefaultWorkspaceName).volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist. The context service's
	// actions are READ-ONLY (automatic), so this package has NO gated action:
	// it never writes a file, commits a batch or spawns an agent, and no
	// verdict can refuse it. read/index/record/suggest/message are automatic;

	// write/commit/spawn wait for approval for the family's write paths.
	// Volatile as one object; a resolved pack's `policy` section overrides the
	// defaults per action (the wiring is the next refinement; the type already
	// exists).
	policy: Policy(),
});
