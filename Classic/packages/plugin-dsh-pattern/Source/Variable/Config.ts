// Config - the pattern service's Schemastery schema (one constant built
// once at load). Composed with the factory's standalone Schema helper
// (`shared: false` - the minimal block, only the universal log/logFile
// volatile cells; the service hooks no fs/observed machinery). Every knob
// is a volatile cell so a hot edit lands on the next service call without a
// remount. The service class reads these through Configure; the defaults
// here are the truth.
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";

export default Compose(false, {
	enabled: Schema.boolean().default(true).volatile(),
	logFile: Schema.string().default("~/.dsh/pattern.log").volatile(),
	storagePath: Schema.string().default("~/.dsh/pattern/registry.json").volatile(),
	matchThreshold: Schema.number().default(0.35).volatile(),
	maxMatches: Schema.number().default(3).volatile(),
	ambiguityEpsilon: Schema.number().default(0.02).volatile(),
	decayHalfLifeDays: Schema.number().default(14).volatile(),
	acceptBonus: Schema.number().default(0.1).volatile(),
	rejectPenalty: Schema.number().default(0.2).volatile(),
	appliedBonus: Schema.number().default(0.15).volatile(),
	failedPenalty: Schema.number().default(0.25).volatile(),
});
