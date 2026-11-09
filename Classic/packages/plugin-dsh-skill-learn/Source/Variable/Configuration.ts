/**
 * @module Configuration
 *
 * The skill-learn service's Schemastery schema (one constant built once at load).
 * Composed with the factory's standalone Schema helper (`shared: false` - the minimal
 * block, so the module advertises only the knobs it owns; the shared `log` cell is the
 * one the service never reads, because it logs through its own `logFile` sink). Every
 * knob is a volatile cell so a hot edit lands on the next service call without a
 * remount. The service class reads these through Configure; the defaults here are the
 * truth.
 *
 * @remarks
 * `enabled` defaults to FALSE - the idle-forever posture: the patch row and the README
 * ship the service disabled, a cold mount logs `disabled (enabled=false)`, and the
 * trigger keeps answering `disabled` while the service stays resolvable, so no listener
 * hard-fails on a missing service.
 *
 * THE BUDGETS ARE SEPARATE ON PURPOSE, because they bound different costs and fail
 * differently: `intervalIterations` bounds how OFTEN a review may run, `digestTail`
 * plus the two per-line caps plus `maxInputChars` bound what one review SENDS,
 * `maxTokens` bounds what it RECEIVES, and the three write caps bound how much of the
 * corpus one reply, one run, and one session may touch. A review that blows any of them
 * is a configuration defect, not a runtime surprise, and both write caps count successes
 * rather than attempts so a refused operation never spends the budget that a real write
 * needs.
 *
 * THE TWO DAY THRESHOLDS ARE FLOORED AT 1: a cutoff at or past now would transition the
 * whole corpus on one bad config.
 */
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";

export default Compose(false, {
	enabled: Schema.boolean()
		.default(false)
		.description("The master switch; FALSE is the shipped posture.")
		.volatile(),
	logFile: Schema.string()
		.default("~/.dsh/playform/plugin-dsh-skill-learn.log")
		.description("The family ledger path; every ledger line names it.")
		.volatile(),
	domain: Schema.string()
		.default("skillLearn")
		.description("The declared storage domain; the JSON sidecar is the store wired here.")
		.volatile(),
	storagePath: Schema.string()
		.default("~/.dsh/skill-learn/usage.json")
		.description("The usage store: one record per skill, and the curator's whole input.")
		.volatile(),
	statePath: Schema.string()
		.default("~/.dsh/skill-learn/state.json")
		.description(
			"Reserved and unread: the curator clock is the usage store's one reserved key.",
		)
		.volatile(),
	ledgerPath: Schema.string()
		.default("~/.dsh/skill-learn/ledger.jsonl")
		.description("The append-only audit ledger: one row per mutation, and the revert handle.")
		.volatile(),
	blobRoot: Schema.string()
		.default("~/.dsh/skill-learn/blobs")
		.description("Content-addressed bytes; a snapshot names these instead of copying them.")
		.volatile(),
	snapshotRoot: Schema.string()
		.default("~/.dsh/skill-learn/snapshots")
		.description("One JSON manifest per whole-tree snapshot.")
		.volatile(),
	reportsRoot: Schema.string()
		.default("~/.dsh/skill-learn/reports")
		.description("One directory per run, holding run.json and REPORT.md.")
		.volatile(),
	snapshotKeep: Schema.number()
		.default(5)
		.min(1)
		.description("How many snapshot manifests survive a rotation; the newest is never pruned.")
		.volatile(),
	skillsRoot: Schema.string()
		.default("~/.dsh/skills")
		.description("The only writable corpus root; other catalog roots are foreign-root.")
		.volatile(),
	archiveRoot: Schema.string()
		.default("~/.dsh/skills/.archive")
		.description("The worst outcome any pass may produce, and never a write target.")
		.volatile(),
	agreementPath: Schema.string()
		.default("~/.dsh/AGENTS.md")
		.description("The working agreement: read-only, and refused by name before any write.")
		.volatile(),
	intervalIterations: Schema.number()
		.default(15)
		.min(1)
		.description("Tool-call blocks since the last review before one is due.")
		.volatile(),
	maxOperations: Schema.number()
		.default(8)
		.min(1)
		.max(8)
		.description("The parsed operation bound; the prompt states eight.")
		.volatile(),
	maxOperationsPerRun: Schema.number()
		.default(4)
		.min(1)
		.description("The applied bound for one run, counted on successes rather than attempts.")
		.volatile(),
	maxWritesPerSession: Schema.number()
		.default(6)
		.min(1)
		.description("The session bound, counted on successes and keyed by the agent object.")
		.volatile(),
	digestTail: Schema.number()
		.default(24)
		.min(1)
		.description("Messages kept verbatim; older ones collapse into one synthetic message.")
		.volatile(),
	digestUserChars: Schema.number()
		.default(300)
		.min(1)
		.description("The per-line cap on a user line in the digest.")
		.volatile(),
	digestAssistantChars: Schema.number()
		.default(200)
		.min(1)
		.description("The per-line cap on an assistant line in the digest.")
		.volatile(),
	maxInputChars: Schema.number()
		.default(120_000)
		.min(1)
		.description("The digest budget of one request.")
		.volatile(),
	maxTokens: Schema.number()
		.default(4000)
		.min(1)
		.description("The reply budget of one request.")
		.volatile(),
	maxSkillChars: Schema.number()
		.default(100_000)
		.min(1)
		.description("The bound on the file a write produces.")
		.volatile(),
	staleAfterDays: Schema.number()
		.default(14)
		.min(1)
		.description("Days of inactivity before a skill is stale; floored at 1.")
		.volatile(),
	archiveAfterDays: Schema.number()
		.default(30)
		.min(1)
		.description("Days of inactivity before a skill is archived; floored at 1.")
		.volatile(),
	curateIntervalHours: Schema.number()
		.default(168)
		.min(1)
		.description("The minimum age of lastRunAt before a curator pass.")
		.volatile(),
	consolidate: Schema.boolean()
		.default(false)
		.description("The opt-in second half of the curator; FALSE is the shipped default.")
		.volatile(),
	provider: Schema.string()
		.default("")
		.description("The route override; empty reads the agent's own provider.")
		.volatile(),
	model: Schema.string()
		.default("")
		.description("The route override; empty reads the agent's own model.")
		.volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist, built HERE rather than
	// composed from the factory's `Policy()`. The factory's block defaults
	// `write` to `approve`; this package ships `write: auto` (plan section 9),
	// so the eight fields are restated with the factory's enum and its one
	// `.volatile()` cell. The block is rebuilt instead of overriding one field
	// because a whole-object `.default({...})` on the composed block is read
	// only when the value is absent entirely, so a partial override such as
	// `{ commit: "auto" }` would silently restore the factory's `write:
	// approve`; restating the fields keeps every partial override merging over
	// THESE verdicts. The service READS the corpus, RECORDS usage and SUGGESTS
	// lessons (read/index/record/suggest, all automatic) and never commits or
	// spawns - those verdicts are declared for family uniformity and stay the
	// shipped `approve`. `write: auto` is what makes the review an ACTOR rather
	// than a proposer: a judged operation publishes behind the fence, which is
	// the Hermes parity decision and the one verdict that differs from the
	// lesson-review sibling.
	policy: Schema.object({
		read: Schema.union(["auto", "approve"]).default("auto"),
		index: Schema.union(["auto", "approve"]).default("auto"),
		record: Schema.union(["auto", "approve"]).default("auto"),
		suggest: Schema.union(["auto", "approve"]).default("auto"),
		write: Schema.union(["auto", "approve"]).default("auto"),
		commit: Schema.union(["auto", "approve"]).default("approve"),
		spawn: Schema.union(["auto", "approve"]).default("approve"),
		message: Schema.union(["auto", "approve"]).default("auto"),
	}).volatile(),
});
