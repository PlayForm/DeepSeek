// Config - the lesson-review service's Schemastery schema (one constant built
// once at load). Composed with the factory's standalone Schema helper
// (`shared: false` - the minimal block, only the universal log/logFile
// volatile cells; the service hooks no fs/observed machinery). Every knob is
// a volatile cell so a hot edit lands on the next service call without a
// remount. The service class reads these through Configure; the defaults here
// are the truth. `enabled` defaults to FALSE - the idle-forever posture: the
// patch row and the README ship the service disabled; a cold mount logs
// `disabled (enabled=false)` and Tick never comes due while the service stays
// resolvable, so the nudge hook never hard-fails on a missing service.
//
// THE THREE BUDGETS are deliberately separate, because they bound different
// costs: `intervalTurns` bounds how OFTEN a review may run, `digestTail` +
// `maxInputChars` bound what one review SENDS, and `maxTokens` bounds what it
// RECEIVES. A review that blows any of the three is a configuration defect,
// not a runtime surprise.
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/plugin-dsh-factory";

export default Compose(false, {
	enabled: Schema.boolean().default(false).volatile(),
	logFile: Schema.string().default("~/.dsh/playform/plugin-dsh-lesson-review.log").volatile(),
	domain: Schema.string().default("lesson").volatile(),
	storagePath: Schema.string().default("~/.dsh/lesson/usage.json").volatile(),
	intervalTurns: Schema.number().default(10).volatile(),
	idleOnly: Schema.boolean().default(true).volatile(),
	staleAfterDays: Schema.number().default(14).volatile(),
	archiveAfterDays: Schema.number().default(30).volatile(),
	neverUsedGraceDays: Schema.number().default(14).volatile(),
	digestTail: Schema.number().default(24).volatile(),
	maxInputChars: Schema.number().default(120_000).volatile(),
	maxProposals: Schema.number().default(8).volatile(),
	consolidate: Schema.boolean().default(false).volatile(),
	promptFile: Schema.string().default("").volatile(),
	skillsRoot: Schema.string().default("~/.dsh/skills").volatile(),
	archiveRoot: Schema.string().default("~/.dsh/skills/.archive").volatile(),
	agreementPath: Schema.string().default("~/.dsh/AGENTS.md").volatile(),
	reportsRoot: Schema.string().default("~/.dsh/lesson/reports").volatile(),
	pendingPath: Schema.string().default("~/.dsh/lesson/pending.jsonl").volatile(),
	provider: Schema.string().default("").volatile(),
	model: Schema.string().default("").volatile(),
	maxTokens: Schema.number().default(4000).volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist, the shared factory
	// block composed into this schema. The review READS the corpus, RECORDS
	// usage and SUGGESTS lessons (read/index/record/suggest, all automatic)
	// and never commits or spawns - those verdicts are declared for family
	// uniformity and stay the shipped `approve`. `write: approve` is what
	// makes the review a PROPOSER by default: a lesson lands in the corpus
	// only when it is accepted.
	policy: Policy(),
});
