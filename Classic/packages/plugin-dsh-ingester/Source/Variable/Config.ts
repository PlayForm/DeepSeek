// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Every tunable is a field; the shape this schema
// produces is Interface/Config.ts.
//
// The class plugin (`export default class Ingester extends Service`) carries
// this schema as a static `Config` (validated before construction). The
// ingester is THE ONLY WRITER of the batch flow (plan section 4) - its knobs
// bound the write path.
import Schema from "@deepseek-ai/schemastery";

export default Schema.object({
	enabled: Schema.boolean().default(true),
	logFile: Schema.string().default("~/.dsh/ingester/ingester.log"),
	maxTargets: Schema.number().default(20),
	// The plan's honest-failure rule: a conflict stops at that target. The
	// default true makes the batch all-or-nothing-past-the-conflict; false
	// lets the apply continue and report each remaining target honestly.
	stopOnConflict: Schema.boolean().default(true),
});
