// Config - the service's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load,
// and `apply` receives a validated plain config object. The shape this schema
// produces is Interface/Config.ts; the contract is
// Documentation/Plans/WORKSPACE-FAMILY-V4-1.md section 3.5.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
// a MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
// uses `shared: false` - the MINIMAL shared block, ONLY the two universal
// volatile cells (`log`, `logFile`). The service's own `logFile` default
// (its SEPARATE ledger, one log per module) is supplied through its own
// fields, which override the minimal block's.
//
// VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
// commit WITHOUT remounting the plugin; the factory's State builder refreshes
// the mapped State fields IN PLACE.
//
// `enabled` defaults to FALSE - the IDLE-forever posture.
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";
import DefaultLens from "@Variable/DefaultLens.js";

export default Compose(false, {
	logFile: Schema.string().default("~/.dsh/context.log").volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The budget: target 2k tokens (V4-1 section 3.5), hard cap configurable.
	budgetTokens: Schema.number().default(2000).volatile(),
	budgetMaximum: Schema.number().default(4000).volatile(),
	// The lenses: the catalog names the packet can be built through; the
	// default is the full shipped catalog.
	lenses: Schema.array(Schema.string())
		.default(DefaultLens.map((Lens) => Lens.name))
		.volatile(),
	// The lens used when the caller names none.
	lensDefault: Schema.string().default("code").volatile(),
	// The packet shape caps.
	neighborLimit: Schema.number().default(20).volatile(),
	evidenceLimit: Schema.number().default(12).volatile(),
	mapLimit: Schema.number().default(12).volatile(),
	// The workspace header name.
	workspaceName: Schema.string().default("workspace").volatile(),
});
