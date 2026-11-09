/**
 * @module Config
 *
 * The lesson-review service's Schemastery schema (one constant built once at load).
 *
 * @remarks
 * Composed with the factory's standalone Schema helper (`shared: false` -
 * the minimal block, only the universal log/logFile volatile cells; the
 * service hooks no fs/observed machinery). Every knob is a volatile cell so
 * a hot edit lands on the next service call without a remount. The service
 * class reads these through Configure; the defaults here are the truth.
 * `enabled` defaults to FALSE - the idle-forever posture: the patch row and
 * the README ship the service disabled; a cold mount logs `disabled
 * (enabled=false)` and Tick never comes due while the service stays
 * resolvable, so the nudge hook never hard-fails on a missing service.
 *
 * THE THREE BUDGETS are deliberately separate, because they bound different
 * costs: `intervalTurns` bounds how OFTEN a review may run, `digestTail` +
 * `maxInputChars` bound what one review SENDS, and `maxTokens` bounds what
 * it RECEIVES. A review that blows any of the three is a configuration
 * defect, not a runtime surprise.
 */
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/plugin-dsh-factory";

const DefaultEnabled = false;
const DefaultLogFile = "~/.dsh/playform/plugin-dsh-lesson-review.log";
const DefaultDomain = "lesson";
const DefaultStoragePath = "~/.dsh/lesson/usage.json";
const DefaultIntervalTurns = 10;
const DefaultIdleOnly = true;
const DefaultStaleAfterDays = 14;
const DefaultArchiveAfterDays = 30;
const DefaultNeverUsedGraceDays = 14;
const DefaultDigestTail = 24;
const DefaultMaxInputChars = 120_000;
const DefaultMaxProposals = 8;
const DefaultConsolidate = false;
const DefaultPromptFile = "";
const DefaultSkillsRoot = "~/.dsh/skills";
const DefaultArchiveRoot = "~/.dsh/skills/.archive";
const DefaultAgreementPath = "~/.dsh/AGENTS.md";
const DefaultReportsRoot = "~/.dsh/lesson/reports";
const DefaultPendingPath = "~/.dsh/lesson/pending.jsonl";
const DefaultProvider = "";
const DefaultModel = "";
const DefaultMaxTokens = 4000;

export default Compose(false, {
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	domain: Schema.string().default(DefaultDomain).volatile(),
	storagePath: Schema.string().default(DefaultStoragePath).volatile(),
	intervalTurns: Schema.number().default(DefaultIntervalTurns).volatile(),
	idleOnly: Schema.boolean().default(DefaultIdleOnly).volatile(),
	staleAfterDays: Schema.number().default(DefaultStaleAfterDays).volatile(),
	archiveAfterDays: Schema.number().default(DefaultArchiveAfterDays).volatile(),
	neverUsedGraceDays: Schema.number().default(DefaultNeverUsedGraceDays).volatile(),
	digestTail: Schema.number().default(DefaultDigestTail).volatile(),
	maxInputChars: Schema.number().default(DefaultMaxInputChars).volatile(),
	maxProposals: Schema.number().default(DefaultMaxProposals).volatile(),
	consolidate: Schema.boolean().default(DefaultConsolidate).volatile(),
	promptFile: Schema.string().default(DefaultPromptFile).volatile(),
	skillsRoot: Schema.string().default(DefaultSkillsRoot).volatile(),
	archiveRoot: Schema.string().default(DefaultArchiveRoot).volatile(),
	agreementPath: Schema.string().default(DefaultAgreementPath).volatile(),
	reportsRoot: Schema.string().default(DefaultReportsRoot).volatile(),
	pendingPath: Schema.string().default(DefaultPendingPath).volatile(),
	provider: Schema.string().default(DefaultProvider).volatile(),
	model: Schema.string().default(DefaultModel).volatile(),
	maxTokens: Schema.number().default(DefaultMaxTokens).volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist, the shared factory
	// block composed into this schema. The review READS the corpus, RECORDS
	// usage and SUGGESTS lessons (read/index/record/suggest, all automatic)
	// and never commits or spawns - those verdicts are declared for family
	// uniformity and stay the shipped `approve`. `write: approve` is what
	// makes the review a PROPOSER by default: a lesson lands in the corpus
	// only when it is accepted.
	policy: Policy(),
});
