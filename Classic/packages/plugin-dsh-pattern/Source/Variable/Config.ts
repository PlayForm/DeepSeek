// Config - the pattern service's Schemastery schema (one constant built
// once at load). Composed with the factory's standalone Schema helper
// (`shared: false` - the minimal block, only the universal log/logFile
// volatile cells; the service hooks no fs/observed machinery). Every knob
// is a volatile cell so a hot edit lands on the next service call without a
// remount. The service class reads these through Configure; the defaults
// here are the truth. `enabled` defaults to FALSE - the idle-forever
// posture: the patch row and the README ship the service disabled; a cold
// mount logs `disabled (enabled=false)` and Match returns the empty result
// (the abstention) while the service stays resolvable.
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/plugin-dsh-factory";

const DefaultEnabled = false;
const DefaultLogFile = "~/.dsh/playform/plugin-dsh-pattern.log";
const DefaultDomain = "pattern";
const DefaultStoragePath = "~/.dsh/pattern/registry.json";
const DefaultMatchThreshold = 0.35;
const DefaultMaxMatches = 3;
const DefaultAmbiguityEpsilon = 0.02;
const DefaultDecayHalfLifeDays = 14;
const DefaultAcceptBonus = 0.1;
const DefaultRejectPenalty = 0.2;
const DefaultAppliedBonus = 0.15;
const DefaultFailedPenalty = 0.25;

export default Compose(false, {
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	// The storage-domain name: the KV domain is the PRIMARY store (the JSON
	// snapshot below is the fallback). A lowercase unit name (the library's
	// UNIT_NAME_RE); the fail-loud check lives in Function/Knobs.
	domain: Schema.string().default(DefaultDomain).volatile(),
	storagePath: Schema.string().default(DefaultStoragePath).volatile(),
	matchThreshold: Schema.number().default(DefaultMatchThreshold).volatile(),
	maxMatches: Schema.number().default(DefaultMaxMatches).volatile(),
	ambiguityEpsilon: Schema.number().default(DefaultAmbiguityEpsilon).volatile(),
	decayHalfLifeDays: Schema.number().default(DefaultDecayHalfLifeDays).volatile(),
	acceptBonus: Schema.number().default(DefaultAcceptBonus).volatile(),
	rejectPenalty: Schema.number().default(DefaultRejectPenalty).volatile(),
	appliedBonus: Schema.number().default(DefaultAppliedBonus).volatile(),
	failedPenalty: Schema.number().default(DefaultFailedPenalty).volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist, the shared factory
	// block composed into this schema. The pattern service MATCHES, RECORDS
	// and DECAYS (read/record/suggest, all automatic) and never writes files,
	// commits or spawns - those verdicts are declared for family uniformity
	// and stay the shipped `approve`. A resolved pack's `policy` section
	// overrides the defaults per action (the wiring is the next refinement).
	policy: Policy(),
});
