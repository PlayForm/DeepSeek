// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built at load). Every tunable is a field; the shape this schema
// produces is Interface/Config.ts.
//
// The class plugin (`export default class Ingester extends Service`) carries
// this schema as a static `Config` (validated before construction). The
// ingester is THE ONLY WRITER of the batch flow (plan section 4) - its knobs
// bound the write path.
import Schema from "@deepseek-ai/schemastery";
import { Policy } from "@playform/ets-plugin-dsh-factory";

export default Schema.object({
	enabled: Schema.boolean().default(true),
	logFile: Schema.string().default("~/.dsh/playform/ets-plugin-dsh-ingester.log"),
	maxTargets: Schema.number().default(20),
	// The plan's honest-failure rule: a conflict stops at that target. The
	// default true makes the batch all-or-nothing-past-the-conflict; false
	// lets the apply continue and report each remaining target honestly.
	stopOnConflict: Schema.boolean().default(true),
	// The recorded-proposal ring bound: the decision consumer holds the
	// proposals it heard on `batch/proposed`, newest last, bounded.
	maxProposals: Schema.number().default(16),
	// THE POLICY BLOCK (D6): the per-action allowlist, the shared factory
	// block composed into this schema. The ingester is THE WRITER of the batch
	// flow, so its own action class is `write` - which stays the shipped
	// `approve` (the decision's approval IS the gate; the block records the
	// posture). A resolved pack's `policy` section overrides the defaults per
	// action (the wiring is the next refinement).
	policy: Policy(),
});
