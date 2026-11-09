/**
 * @module Library
 *
 * The entry module of the SKILL-LEARN service (@playform/plugin-dsh-skill-learn), the
 * Hermes learning loop as one fenced package: the post-turn review that turns a finished
 * session into skill edits, and the curator that ages the corpus.
 *
 * @remarks
 * Loader contract: the CLASS form the family uses - `export default class
 * SkillLearnService extends Service` with `super(Context, "skillLearn")`, `static
 * inject`, `static Config = Definition` and the named `Config` schema export beside it
 * (`Classic/packages/plugin-dsh-lesson-review/Source/Library.ts:112-116`). Every service
 * method is a thin delegate; the only behaviour this file owns is the sequencing of the
 * leaves and the ledger lines, because the leaves have no logger (plan section 6.7).
 *
 * THE SERVICE SURFACE (ctx.skillLearn), thirteen methods (plan section 2):
 *
 * - Configure(options) - apply validated config knobs (volatile cells)
 * - Trigger(agent) - the idle-edge gate: the counter, the caps, the claim, the review,
 *   one ledger line
 * - Review({agent, signal}) - ONE review: transcript -> digest -> llm -> route ->
 *   catalog -> phase 1 -> parse -> views -> phase 2 -> parse -> judge -> write -> ledger
 *   -> report
 * - Curate(now?) - the deterministic R1-R10 lifecycle pass
 * - Consolidate({dryRun?}) - the opt-in survey pass (ships off)
 * - Record(name, agent?) - one observed load through the `skill` tool
 * - Revert(identifier) - one audit row back to files, fail-closed
 * - Status() - counts (total/active/stale/archived/pinned/tracked/lastRunAt)
 * - Pin(name, pinned) - the lifecycle exemption
 * - Restore(name) - put a neutralized skill back into the catalog
 * - Digest(messages) - the bounded digest (Function/Digest)
 * - Prompt(phase) - the byte-stable phase prompt (Function/Prompt)
 * - Save() - the store flush (the smoke seam)
 *
 * THE TWO LISTENERS ARE REGISTERED HERE, because a listener is wiring and the family
 * keeps wiring in the entry (`code-authoring` rule 13). A class plugin has no `apply`:
 * construction IS the load, and the fiber is already active (`Service`'s own constructor
 * provides the service through `ctx.reflect`), so both registrations below are
 * apply-time effects.
 *
 * 1. `agent/status` (EMIT, idle only). An emit listener is a SYNCHRONOUS recorder: the
 *    review is detached with a `.catch` that ledgers and never throws into the emitter,
 *    the pattern at
 *    `Classic/packages/hook-dsh-lesson-nudge/Source/Function/Apply.ts:187-192`. The idle
 *    edge is the only moment a review may run, because `agent.runMaintenance` is what
 *    claims that phase (`dsh-agent/lib/types/runtime-types.d.ts:164-174`), and the claim
 *    lives in `Function/Trigger`, not here.
 * 2. `tools/post-execute` (WATERFALL). It calls `next()` exactly once, and records one
 *    use when `exec.name === "skill"`. A waterfall observer that omits `next()` silently
 *    swallows the downstream default, so the omission would break every `skill` call
 *    rather than merely skipping a record (plan section 8.2 item 4).
 *
 * WHY THE HARNESS TYPES ARE IMPORTED FOR THEIR DECLARATIONS ALONE: the `agent/status`
 * and `tools/post-execute` events are declared inside `declare module
 * "@deepseek-ai/cordis"` blocks in the harness's own type files, and those augmentations
 * are visible only in a compilation unit that has LOADED them. `import type {}` loads
 * them and emits nothing - the pattern at
 * `Classic/packages/hook-dsh-lesson-nudge/Source/Interface/Agent.ts:1-15` and
 * `Classic/packages/hook-dsh-ccr/Source/Interface/Factory.ts:14-19`.
 *
 * EVERY DEGRADATION IS LOUD AND NON-FATAL: no `llm` service, no model route, an empty
 * transcript, an unparseable reply, a failed model call - each is one of the twelve
 * outcome classes (plan section 3.2), and each ends in exactly one byte-stable ledger
 * line (plan section 6.7). Nothing here throws into the emitter, and nothing here throws
 * into the maintenance task.
 */
import Path from "node:path";

import { Service, type Context } from "@deepseek-ai/cordis";

import type {} from "@deepseek-ai/dsh-agent";
import type {} from "@deepseek-ai/dsh-tools";

import { Activate } from "@playform/lib-dsh-core";

import { Restore as Unarchive } from "./Function/Archive.js";
import Catalog, { type CatalogOptions } from "./Function/Catalog.js";
import Confirm, { type View as Carried } from "./Function/Confirm.js";
import Consolidate, { type Request as ConsolidationRequest } from "./Function/Consolidate.js";
import Curate from "./Function/Curate.js";
import Digest, { type DigestResult } from "./Function/Digest.js";
import Judge from "./Function/Judge.js";
import Knobs from "./Function/Knobs.js";
import Append from "./Function/Ledger.js";
import Parse from "./Function/Parse.js";
import Plan from "./Function/Plan.js";
import Prompt from "./Function/Prompt.js";
import Report from "./Function/Report.js";
import Revert, { type Reverted } from "./Function/Revert.js";
import Route from "./Function/Route.js";
import Transcript from "./Function/Transcript.js";
import Gate, { type Session } from "./Function/Trigger.js";
import Usage from "./Function/Usage.js";
import Write, { Expand, Locate, Text, type Seam } from "./Function/Write.js";
import type Agent from "./Interface/Agent.js";
import type Configuration from "./Interface/Configuration.js";
import type { ConsolidationPlan, ConsolidationResult } from "./Interface/Consolidation.js";
import type { Corpus } from "./Interface/Corpus.js";
import type { Curation } from "./Interface/Curation.js";
import type Message from "./Interface/Message.js";
import type { Operation } from "./Interface/Operation.js";
import type UsageRecord from "./Interface/Record.js";
import type { ReviewInput, ReviewRefusal, ReviewResult, ReviewRule } from "./Interface/Review.js";
import type { LlmSlice, SkillsSlice, WorkingDirectorySlice } from "./Interface/Services.js";
import type { LoadedSkill } from "./Interface/Skill.js";
import type { Outcome, Trigger } from "./Interface/Trigger.js";
import Definition from "./Variable/Configuration.js";
import Version from "./Variable/Version.js";

/** The corpus-wide counts (plan section 2, row 8). */
export interface Status {
	/** Every record the usage store holds. */
	readonly total: number;

	/** Records in the `active` state. */
	readonly active: number;

	/** Records in the `stale` state. */
	readonly stale: number;

	/** Records in the `archived` state; only `Restore` leaves it. */
	readonly archived: number;

	/** Records exempt from every transition. */
	readonly pinned: number;

	/** Records in the curator's jurisdiction, which is what `Curate` walks. */
	readonly tracked: number;

	/** When the curator last ran, or null before its first pass. */
	readonly lastRunAt: string | null;
}

/** The lifecycle answer (`Pin`, `Restore`): the verdict, its class, and one clause. */
export interface Lifecycle {
	/** Whether the lifecycle move landed. */
	readonly ok: boolean;

	/** The class the move ended in; the first five are successes. */
	readonly outcome:
		| "pinned"
		| "unpinned"
		| "restored"
		| "not-tracked"
		| "not-archived"
		| "destination-exists"
		| "foreign-root"
		| "failed";

	/** One clause naming why a move was refused, or the path it wrote. */
	readonly detail: string;
}

/** One review request: the leaf's input plus the claimed run's write budget. */
export interface ReviewRequest extends ReviewInput {
	/**
	 * The session the write cap counts on. Present only when the run came from
	 * the idle edge through `Gate.Run`, whose session IS the cap
	 * (`Function/Trigger.ts:69-91`); a direct call has no claimed run, so the
	 * per-run cap is its tighter bound (plan section 6.6).
	 */
	readonly session?: Session;
}

/** The session a direct `Review` call spends, which is none: there is no claimed run. */
const Unbudgeted: Session = { writes: 0, spend: () => 0 };

/** The digest a run that stopped before the transcript reports. */
const Empty = { text: "", kept: 0, collapsed: 0 } satisfies DigestResult;

/** What one run learned about the corpus before the judge ran (plan section 4.6). */
interface Evidence {
	/** Every name the run probed, and the catalog's answer; null when it resolved none. */
	readonly skills: Map<string, LoadedSkill | null>;

	/** The bodies the confirm prompt carried, by skill name. */
	readonly bodies: Map<string, string>;

	/** The support files the run read, by `Support` key; null when the file was absent. */
	readonly supports: Map<string, string | null>;
}

/** The run's working record, mutated as the pipeline advances so an early return still reports. */
interface Draft {
	/** When the run started; the report's directory name and its first line. */
	readonly startedAt: Date;

	/** The provider that answered, or "" when no call was made. */
	provider: string;

	/** The model that answered, or "" when no call was made. */
	model: string;

	/** What the digest kept and collapsed. */
	digest: DigestResult;

	/** How many skill bodies the confirm prompt carried. */
	views: number;

	/** How many operations the final reply named. */
	operations: number;

	/** The skills whose bytes changed. */
	applied: string[];

	/** Every operation the judge or the fence refused. */
	refused: ReviewRefusal[];

	/** The audit row ids the run appended. */
	ledger: string[];

	/** The snapshot taken before the run; always "" for a review, which takes none. */
	snapshot: string;

	/** The session's spent write count at the end of the run. */
	writes: number;
}

/** The family ledger line: `skillLearn: <clause> (logFile <path>)` (plan section 6.7). */
const Line = (Clause: string, Knobs: Configuration): string =>
	`skillLearn: ${Clause} (logFile ${Knobs.logFile})`;

/** The message of a caught value, for a ledger clause. */
const Reason = (Cause: unknown): string => (Cause instanceof Error ? Cause.message : String(Cause));

/** The key one support file is carried under: a skill name and its path under it. */
const Support = (Name: string, FilePath: string): string => `${Name}\n${FilePath}`;

/**
 * Canonical path containment, in the synchronous form `Interface/Corpus`
 * requires: the judge's `contains` cannot wait (`Interface/Corpus.ts:5-8`), so
 * it compares resolved paths. The AUTHORITATIVE fence is `Function/Write`'s
 * `Seam.contains` over provider-resolved targets (`Function/Write.ts:239-259`),
 * and the judge's `never-archive` is the early refusal, not the boundary.
 */
const Contained = (Parent: string, Child: string): boolean => {
	const Root = Path.resolve(Expand(Parent));
	const Target = Path.resolve(Expand(Child));
	switch (true) {
		case Target === Root:
			return true;
		default:
			return Target.startsWith(`${Root}${Path.sep}`);
	}
};

/**
 * Narrow the harness's agent to the structural surface this package reads. The
 * cast is the ONE the design names: `Interface/Review.ts:3-7` says the service
 * is the single place that narrows `unknown`, and `Function/Transcript.ts:13-19`
 * says it does so by cast, because the harness's message block union is wider
 * than the two blocks the digest reads.
 */
const Narrow = (Agent_: unknown): Agent => Agent_ as Agent;

/** One field of a tool call's parsed arguments; `arguments` is declared `unknown`. */
const Field = (Given: unknown, Key: string): unknown =>
	typeof Given === "object" && Given !== null ? Reflect.get(Given, Key) : undefined;

/**
 * The judge id a FENCE refusal is reported under. The fence's own classes -
 * `foreign-root`, `body-carried`, `failed` - are section 6.2's guard outcomes
 * and not judge rule ids, so the pipeline reports the closest rule whose
 * subject is the same file and keeps the fence's class in the detail.
 */
const Rule = (Outcome: "foreign-root" | "body-carried" | "failed"): ReviewRule => {
	switch (Outcome) {
		case "foreign-root":
			return "never-archive";
		default:
			return "body-carried";
	}
};

/**
 * The outcome clause of one ledger line, for all twelve classes (plan section
 * 6.7, byte for byte). The two callers hold different halves of the facts - the
 * gate holds the counter and the session, the pipeline holds the reply - so the
 * fields either side may not have are read through the optional chain and only
 * by the arms that need them.
 */
const Clause = (
	Outcome: Outcome,
	Facts: { readonly views: number; readonly result?: ReviewResult; readonly verdict?: Trigger },
	Knobs: Configuration,
): string => {
	switch (Outcome) {
		case "disabled":
			return "disabled (enabled=false)";
		case "below-threshold":
			return `skipped (below-threshold ${Facts.verdict?.count ?? 0}/${Knobs.intervalIterations})`;
		case "capped":
			return `skipped (cap reached ${Facts.verdict?.writes ?? 0}/${Knobs.maxWritesPerSession} writes)`;
		case "busy":
			return "skipped (busy: the agent is not idle)";
		case "no-llm":
			return "unavailable (no llm service)";
		case "no-route":
			return "unavailable (no model route)";
		case "empty-transcript":
			return "unavailable (empty transcript)";
		case "model-failed":
			return `failed (model call: ${Facts.result?.detail ?? "the run rejected"})`;
		case "unparsable":
			return `failed (unparsable ${Facts.result?.detail ?? ""})`;
		case "nothing":
			return `reviewed nothing (${Facts.views} views, 0 operations)`;
		case "refused":
			return `reviewed refused (${Facts.result?.refused.length ?? 0} refused: ${Facts.result?.refused[0]?.rule ?? ""})`;
		case "applied":
			return `reviewed applied ${Facts.result?.applied.length ?? 0} (${Facts.result?.refused.length ?? 0} refused)`;
		default:
			// Unreachable: the union is closed at twelve and every arm returns.
			return "failed (unknown outcome)";
	}
};

/** The operation's carried body: the file the write would touch, as the model saw it. */
const Carry = (Operation: Operation, Evidence_: Evidence): string | null => {
	switch (Operation.kind) {
		case "create":
			return null;
		case "patch":
			return Evidence_.bodies.get(Operation.skill) ?? null;
		default:
			return Evidence_.supports.get(Support(Operation.skill, Operation.filePath)) ?? null;
	}
};

/** The refusal every member of the absent seam reports, so the cause is one clause. */
const Refuse = (): Promise<never> => Promise.reject(new Error("no fs service"));

/**
 * The seam a service with no mounted `ctx.fs` hands its leaves. Every member
 * refuses with the same named error, which is the opposite of a silent skip: the
 * fence turns it into its own `failed` class, and the archive, the revert and the
 * curator each turn it into the failure class they already own, so the cause
 * reaches the report instead of a property read on `undefined` reaching it as an
 * anonymous TypeError.
 */
const Absent: Seam = {
	resolve: Refuse,
	stat: Refuse,
	readText: Refuse,
	listDir: Refuse,
	writeText: Refuse,
	editText: Refuse,
	contains: (): boolean => {
		throw new Error("no fs service");
	},
};

export default class SkillLearnService extends Service {
	static inject: string[] = [];

	/** The loader-contract Config (validated at load; knobs via Configure). */
	static Config = Definition;

	/** The knobs: constructor defaults plus the loader's validated config. */
	private Knobs: Configuration;

	/** The usage store (Function/Usage), bound to the expanded `storagePath` at construction. */
	private Usage: Usage;

	/**
	 * The idle-edge gate (Function/Trigger). Its two WeakMaps ARE the per-agent
	 * state this service owns - the trigger counter (`Reviewed`) and the session
	 * write cap (`Spent`), both keyed by the agent object, so a resumed session
	 * starts a fresh budget (plan section 14, question 2).
	 */
	private Gate: Gate = new Gate();

	/** The ledger sink (best-effort, never throws). */
	private Ledger: (Message: string) => void;

	/** The harness context (the optional `llm`, `skills` and `workingDirectory` probes). */
	private Context: Context;

	constructor(Context_: Context, Raw?: unknown) {
		super(Context_, "skillLearn");
		this.Context = Context_;
		this.Knobs = Knobs(Raw);
		this.Usage = new Usage(Expand(this.Knobs.storagePath));
		this.Ledger = (Message: string): void => {
			try {
				Context_.logger?.info(Message);
			} catch {
				/* logger optional */
			}
		};
		// The activation proof - "did it activate" must be answerable from the
		// ledger alone (`Classic/packages/plugin-dsh-lesson-review/Source/Library.ts:148-157`):
		//   skillLearn: activated (bundle=0.2.1, interval=15 calls, ...) (logFile ...)
		this.Ledger(
			Line(
				this.Knobs.enabled
					? Activate([
							["bundle", Version],
							["interval", `${this.Knobs.intervalIterations} calls`],
							["corpus", this.Knobs.skillsRoot],
							["write", this.Knobs.policy.write],
						])
					: "disabled (enabled=false)",
				this.Knobs,
			),
		);
		// The store's one load runs detached (a constructor cannot await); the
		// quarantine line is the only load outcome the ledger states, and the
		// quarantined bytes stay on disk for inspection (plan section 8.3).
		void this.Usage.Load().then((Loaded) => {
			switch (true) {
				case Loaded.quarantined === undefined:
					break;
				default:
					this.Ledger(
						Line(
							`usage store unreadable (${Loaded.error ?? "unknown"}); quarantined to ${Loaded.quarantined}`,
							this.Knobs,
						),
					);
			}
		});
		// ------------------------------------------------------------------
		// Listener 1: agent/status - the idle edge, in `emit` mode.
		// ------------------------------------------------------------------
		this.Context.on("agent/status", (Payload) => {
			try {
				switch (true) {
					// The cheapest gate first, and the reason it is here rather than
					// only inside the gate: a disabled plugin would otherwise write
					// one `disabled` line per turn end
					// (`Classic/packages/hook-dsh-lesson-nudge/Source/Function/Apply.ts:121-122`).
					case !this.Knobs.enabled:
						return;
					case Payload?.status !== "idle":
						return;
					default:
						break;
				}
				// An emit listener is a synchronous recorder, so the run is
				// DETACHED and its rejection can never reach the emitter.
				void this.Edge(Payload.agent).catch((Cause: unknown) => {
					this.Ledger(Line(`failed (task: ${Reason(Cause)})`, this.Knobs));
				});
			} catch (Cause) {
				// Fail-open: never throw into a status emit.
				this.Ledger(Line(`failed (task: ${Reason(Cause)})`, this.Knobs));
			}
		});
		// ------------------------------------------------------------------
		// Listener 2: tools/post-execute - the use seam, in WATERFALL mode.
		// ------------------------------------------------------------------
		this.Context.on("tools/post-execute", (Exec, _Result, Next) => {
			try {
				if (Exec.name === "skill") {
					const Name = Field(Exec.arguments, "name");
					if (typeof Name === "string" && Name.trim() !== "") {
						// Enqueued and not awaited: the tool pipeline keeps its
						// latency (plan section 8.2 item 3).
						void this.Record(Name.trim()).catch((Cause: unknown) => {
							this.Ledger(Line(`failed (store: ${Reason(Cause)})`, this.Knobs));
						});
					}
				}
			} catch (Cause) {
				try {
					Context_.logger?.warn(`skillLearn: ${Reason(Cause)}; the use is not recorded`);
				} catch {
					/* logger optional */
				}
			}
			// Called exactly once, outside the guard: a waterfall that omits
			// `next()` swallows the downstream default (plan section 8.2 item 4).
			return Next();
		});
	}

	/** Apply the validated config knobs (called by the host on load/volatile). */
	Configure(Options: Partial<Configuration>): void {
		this.Knobs = { ...this.Knobs, ...Options };
	}

	/**
	 * One idle edge: the review, then the curator when its interval is due. The
	 * counter, the caps and the maintenance claim are `Gate.Run`'s
	 * (`Function/Trigger.ts:76-117`); this method only sequences the two halves.
	 */
	async Trigger(Agent_: unknown): Promise<Trigger> {
		const Agent = Narrow(Agent_);
		const Verdict = await this.Gate.Run({
			agent: Agent,
			// The counter's input is the tool-call BLOCKS the session produced, not
			// its messages (`Function/Transcript.ts:21-26`).
			count: Transcript(Agent).toolCalls,
			configuration: this.Knobs,
			review: (Signal: AbortSignal, Session_: Session): Promise<ReviewResult> =>
				this.Review({ agent: Agent, signal: Signal, session: Session_ }),
		});
		switch (Verdict.outcome) {
			case "disabled":
			case "below-threshold":
			case "capped":
			case "busy":
				this.Ledger(
					Line(
						Clause(Verdict.outcome, { views: 0, verdict: Verdict }, this.Knobs),
						this.Knobs,
					),
				);
				break;
			default:
				// The eight post-model classes were logged by the run itself, and
				// the gate's own `model-failed` arm is unreachable while the
				// pipeline keeps its no-throw contract (`Function/Trigger.ts:110-116`).
				break;
		}
		return Verdict;
	}

	/** One review. Never throws; every degradation is one of the twelve classes. */
	async Review(Input: ReviewRequest): Promise<ReviewResult> {
		return this.Pipeline(Narrow(Input.agent), Input.signal, Input.session ?? Unbudgeted);
	}

	/** The deterministic lifecycle pass, and the consolidation pass when it is enabled. */
	async Curate(Now: Date = new Date()): Promise<Curation> {
		const Counts = await Curate(Now, this.Usage, this.Seam(), this.Knobs);
		// The clock is recorded AFTER the pass, in the store that already persists,
		// so a restart does not reset the interval: an in-memory clock would make a
		// machine that restarts often never curate at all, because every pass would
		// be the seeding pass that transitions nothing (plan section 3.1). The pass
		// has already saved its transitions, so this second save carries the one
		// fact that is not a record.
		this.Usage.Curated(Now);
		await this.Save();
		this.Refresh();
		this.Ledger(
			Line(
				`curated checked=${Counts.checked} seeded=${Counts.seeded} stale=${Counts.markedStale} archived=${Counts.archived} reactivated=${Counts.reactivated}`,
				this.Knobs,
			),
		);
		switch (true) {
			case !this.Knobs.consolidate:
				break;
			default:
				// The plan runs `Consolidate` inside `Curate` when it is enabled
				// (plan section 3.1). Its result is not carried into `Curation`,
				// which has no field for it, so a caller that needs the counters
				// calls `Consolidate` itself.
				await this.Consolidate({});
		}
		return Counts;
	}

	/**
	 * The opt-in survey pass. `consolidate: false` is the shipped posture, so the
	 * leaf returns `disabled` before it ever asks for a plan
	 * (`Function/Consolidate.ts:110-116`).
	 */
	async Consolidate(
		Options: { readonly signal?: AbortSignal; readonly dryRun?: boolean } = {},
	): Promise<ConsolidationResult> {
		// No body is carried, so a consolidation patch is refused by the same
		// `body-carried` rule a review patch is: read-before-write holds here too
		// (`Function/Consolidate.ts:25-29`).
		const Evidence: Evidence = { skills: new Map(), bodies: new Map(), supports: new Map() };
		const Request_: ConsolidationRequest = {
			store: this.Usage,
			corpus: this.CorpusView(Evidence),
			seam: this.Seam(),
			configuration: this.Knobs,
			dryRun: Options.dryRun === true,
			report: "",
			// NO LEAF OWNS THE CONSOLIDATION PROMPT OR ITS PLAN PARSER:
			// `Variable/Blocks` ships the two review phases only, and plan
			// section 7.4 specifies the five guards rather than a byte-stable
			// text. The pass therefore reports `model-failed` instead of
			// inventing a prompt, and the shipped `consolidate: false` never
			// reaches this line.
			ask: (): Promise<ConsolidationPlan | null> => Promise.resolve(null),
		};
		const Result = await Consolidate(Request_);
		this.Refresh();
		return Result;
	}

	/** One observed load through the `skill` tool. A store failure ledgers and returns. */
	async Record(Name: string, _Agent?: unknown): Promise<void> {
		// The store is global and one chain serialises every write
		// (`Function/Usage.ts:142-157`), so the agent is accepted for the caller's
		// contract and not read.
		this.Usage.Use(Name, new Date());
		await this.Save();
	}

	/** One audit row back to files, fail-closed (`Function/Revert.ts:1-24`). */
	async Revert(Identifier: string): Promise<Reverted> {
		const Result = await Revert(Identifier, this.Seam(), this.Knobs);
		switch (true) {
			case !Result.ok:
				// Section 6.7 defines the line for a revert that happened; a refused
				// revert reports through `outcome` and `detail`, and the audit
				// ledger's `pre-rollback` row records the attempt.
				return Result;
			default:
				break;
		}
		this.Refresh();
		this.Ledger(
			Line(
				`reverted ${Identifier} (${Result.restored} file(s), ${Result.retained} retained)`,
				this.Knobs,
			),
		);
		return Result;
	}

	/** The corpus-wide counts. Always answers; the store is quarantined before the read. */
	Status(): Status {
		const All = this.Usage.All();
		// The clock is the store's, not the instance's: a restart keeps it, which is
		// the whole point of persisting it (plan section 3.1).
		const Last = this.Usage.CuratedAt();
		return {
			total: All.length,
			active: All.filter((Stored) => Stored.record.state === "active").length,
			stale: All.filter((Stored) => Stored.record.state === "stale").length,
			archived: All.filter((Stored) => Stored.record.state === "archived").length,
			pinned: All.filter((Stored) => Stored.record.pinned).length,
			// The curator's jurisdiction: the plugin's own create, or a pin
			// (`Function/Curate.ts:63-64`).
			tracked: All.filter(
				(Stored) => Stored.record.createdBy === "agent" || Stored.record.pinned,
			).length,
			lastRunAt: Last === null ? null : new Date(Last).toISOString(),
		};
	}

	/** Exempt one skill from every transition, or lift the exemption. */
	async Pin(Name: string, Pinned: boolean): Promise<Lifecycle> {
		const Root = Expand(this.Knobs.skillsRoot);
		switch (true) {
			case !Contained(Root, Path.join(Root, Name)):
				return { ok: false, outcome: "foreign-root", detail: `${Name} is outside ${Root}` };
			default:
				break;
		}
		const Record_ = this.Usage.Pinned(Name, Pinned);
		switch (true) {
			case Record_ === undefined:
				return { ok: false, outcome: "not-tracked", detail: `${Name} has no usage record` };
			default:
				break;
		}
		await this.Save();
		return { ok: true, outcome: Pinned ? "pinned" : "unpinned", detail: "" };
	}

	/** Put one archived skill back into the catalog and reactivate its record. */
	async Restore(Name: string): Promise<Lifecycle> {
		const Result = await Unarchive(Name, this.Seam(), this.Knobs);
		switch (true) {
			case !Result.ok:
				return { ok: false, outcome: Result.outcome, detail: Result.detail ?? "" };
			default:
				break;
		}
		this.Usage.State(Name, "active", new Date());
		await this.Save();
		this.Refresh();
		return { ok: true, outcome: "restored", detail: Result.path };
	}

	/** The bounded digest of one derived transcript. */
	Digest(Messages: readonly Message[]): DigestResult {
		return Digest(Messages, {
			digestTail: this.Knobs.digestTail,
			digestUserChars: this.Knobs.digestUserChars,
			digestAssistantChars: this.Knobs.digestAssistantChars,
		});
	}

	/** The byte-stable phase prompt; there is no assembly here by design. */
	Prompt(Phase: 1 | 2): string {
		return Prompt(Phase);
	}

	/** Persist the usage store (the smoke seam). Swallows and ledgers. */
	async Save(): Promise<void> {
		const Result = await this.Usage.Save();
		switch (true) {
			case Result.ok:
				return;
			default:
				this.Ledger(Line(`failed (store: ${Result.error ?? "unknown"})`, this.Knobs));
		}
	}

	// ------------------------------------------------------------------
	// Internals
	// ------------------------------------------------------------------

	/**
	 * The pipeline of plan section 3.1, steps 8 to 23. It runs INSIDE the claimed
	 * idle phase, so it never drives the agent and never touches the live turn,
	 * and it never throws: every risky read is guarded, and every exit writes the
	 * report and exactly one ledger line.
	 */
	private async Pipeline(
		Agent: Agent,
		Signal: AbortSignal,
		Session_: Session,
	): Promise<ReviewResult> {
		const Draft: Draft = {
			startedAt: new Date(),
			provider: "",
			model: "",
			digest: Empty,
			views: 0,
			operations: 0,
			applied: [],
			refused: [],
			ledger: [],
			snapshot: "",
			writes: Session_.writes,
		};
		// 8. The transcript. An empty one is the honest outcome of a session that
		// has nothing to review (`Function/Transcript.ts:28-32`).
		const Derived = Transcript(Agent);
		if (Derived.messages.length === 0) {
			return this.Finish(Draft, "empty-transcript", "");
		}
		// 9. The digest.
		const Digest_ = this.Digest(Derived.messages);
		Draft.digest = Digest_;
		// 10. The llm probe. Absent is `no-llm`, never a throw (plan section 3.2).
		const Llm = this.Llm();
		if (Llm === undefined) {
			return this.Finish(Draft, "no-llm", "");
		}
		// 11. The route: the knobs win, then the agent's own options.
		const Route_ = Route(Agent, this.Knobs);
		if (Route_ === undefined) {
			return this.Finish(Draft, "no-route", "");
		}
		Draft.provider = Route_.provider;
		Draft.model = Route_.model;
		// 12. The catalog index, filtered for model invocation by the leaf.
		const Where = await this.Where(Agent, Signal);
		const Index = await this.Index(Where);
		// 13. Phase 1, one hand-built stream call.
		let Reply: string;
		try {
			Reply = await Plan(Llm, {
				route: Route_,
				system: this.Prompt(1),
				digest: Digest_.text,
				index: Index,
				maxTokens: this.Knobs.maxTokens,
				signal: Signal,
			});
		} catch (Cause) {
			return this.Finish(Draft, "model-failed", Reason(Cause));
		}
		// 14. The strict parse. A failure ends the run; there is no repair pass.
		const Planned = Parse(Reply, 1, this.Knobs.maxOperations);
		if (!Planned.ok) {
			return this.Finish(Draft, "unparsable", `${Planned.id}: ${Planned.detail}`);
		}
		const PlannedBody = Planned.reply;
		const Views = "views" in PlannedBody ? PlannedBody.views : [];
		// 15. The view set is the PLUGIN's: the model's `views` unioned with every
		// patch and support target, so the model cannot name a target it was not
		// shown (plan section 4.2, and the identity in section 4.6).
		const Targets = new Set<string>(Views);
		for (const Operation of PlannedBody.operations) {
			if (Operation.kind !== "create") {
				Targets.add(Operation.skill);
			}
		}
		// 16. Load each view. A provider that rejects is a name the catalog does
		// not resolve, which the judge then refuses as `target-present`.
		const Evidence: Evidence = { skills: new Map(), bodies: new Map(), supports: new Map() };
		for (const Name of Targets) {
			const Found = await this.Lookup(Name, Where);
			Evidence.skills.set(Name, Found ?? null);
			if (Found !== undefined) {
				Evidence.bodies.set(Name, Found.content);
			}
		}
		// A create names a skill that should NOT exist; probing it is what lets
		// `target-absent` refuse a create the catalog already resolves.
		for (const Operation of PlannedBody.operations) {
			if (Evidence.skills.has(Operation.skill)) {
				continue;
			}
			Evidence.skills.set(
				Operation.skill,
				(await this.Lookup(Operation.skill, Where)) ?? null,
			);
		}
		const Corpus_ = this.CorpusView(Evidence);
		// A support write's carried body is the support file's own text, read
		// before the judge exactly as a `SKILL.md` body is (plan section 6.1).
		for (const Operation of PlannedBody.operations) {
			if (Operation.kind !== "support") {
				continue;
			}
			const Key = Support(Operation.skill, Operation.filePath);
			if (Evidence.supports.has(Key)) {
				continue;
			}
			Evidence.supports.set(
				Key,
				await this.Body(Locate(Operation, Corpus_, this.Knobs).path),
			);
		}
		Draft.views = Evidence.bodies.size;
		Draft.operations = PlannedBody.operations.length;
		// 17. Phase 2, only when the view set is non-empty. When it is empty every
		// operation is a create, and phase 1's list is judged as it stands.
		let Final: readonly Operation[] = PlannedBody.operations;
		if (Targets.size > 0) {
			const Bodies: Carried[] = [];
			for (const Name of Targets) {
				const Body = Evidence.bodies.get(Name);
				if (Body !== undefined) {
					Bodies.push({ name: Name, body: Body });
				}
			}
			let Confirmation: string;
			try {
				Confirmation = await Confirm(Llm, {
					route: Route_,
					system: this.Prompt(2),
					digest: Digest_.text,
					index: Index,
					views: Bodies,
					maxTokens: this.Knobs.maxTokens,
					signal: Signal,
				});
			} catch (Cause) {
				return this.Finish(Draft, "model-failed", Reason(Cause));
			}
			// 18. The strict parse of the final list.
			const Confirmed = Parse(Confirmation, 2, this.Knobs.maxOperations);
			if (!Confirmed.ok) {
				return this.Finish(Draft, "unparsable", `${Confirmed.id}: ${Confirmed.detail}`);
			}
			Final = Confirmed.reply.operations;
			Draft.operations = Final.length;
		}
		// 19. The judge, over every operation and the corpus view.
		const Accepted: Operation[] = [];
		for (const Operation of Final) {
			const Refusal = Judge(Operation, Corpus_, this.Knobs);
			if (Refusal !== null) {
				Draft.refused.push(Refusal);
				continue;
			}
			Accepted.push(Operation);
		}
		// 20. Apply each accepted operation through the fence, re-reading both
		// caps before each, because both count SUCCESSES and never attempts
		// (plan section 6.6).
		const Now = new Date();
		let Applied = 0;
		let Detail = "";
		for (const Operation of Accepted) {
			if (Applied >= this.Knobs.maxOperationsPerRun) {
				Detail = "run cap";
				break;
			}
			if (Session_.writes >= this.Knobs.maxWritesPerSession) {
				Detail = "session cap";
				break;
			}
			const Fenced = await Write({
				operation: Operation,
				carried: Carry(Operation, Evidence),
				corpus: Corpus_,
				seam: this.Seam(),
				configuration: this.Knobs,
			});
			if (!Fenced.ok) {
				Draft.refused.push({
					operation: Operation,
					rule: Rule(Fenced.outcome),
					detail: `${Fenced.outcome}: ${Fenced.detail}`,
				});
				continue;
			}
			// 21. One audit row per write, with the before and after blobs.
			const Appended = await Append(
				{
					actor: "agent",
					action: Operation.kind,
					skill: Operation.skill,
					evidence: { session: Agent.id, reason: Operation.reason, rule: "" },
					before: [{ path: Fenced.applied.path, text: Fenced.applied.before }],
					after: [{ path: Fenced.applied.path, text: Fenced.applied.after }],
				},
				this.Knobs,
			);
			if (Appended.id !== "") {
				Draft.ledger.push(Appended.id);
			}
			switch (true) {
				case Operation.kind === "create":
					// `createdBy: "agent"` is the curation opt-in, not an authorship
					// claim (`Function/Usage.ts:286-295`).
					this.Usage.Created(Operation.skill, Now);
					break;
				default:
					this.Usage.Patched(Operation.skill, Now);
					break;
			}
			Applied += 1;
			Session_.spend();
			Draft.applied.push(Operation.skill);
			// The catalog is stale after a write until it is invalidated, and the
			// provider's watcher is best-effort (plan section 6.0, fact 6).
			this.Refresh();
		}
		await this.Save();
		Draft.writes = Session_.writes;
		// 22 and 23: the report and the one ledger line, both in `Finish`.
		const Ended: Outcome =
			Draft.applied.length > 0 ? "applied" : Draft.refused.length > 0 ? "refused" : "nothing";
		return this.Finish(Draft, Ended, Detail);
	}

	/** Write the run report and its one ledger line, and answer the result. */
	private async Finish(Draft: Draft, Outcome: Outcome, Detail: string): Promise<ReviewResult> {
		const Report_ = await Report(Expand(this.Knobs.reportsRoot), {
			startedAt: Draft.startedAt.toISOString(),
			durationMs: Date.now() - Draft.startedAt.getTime(),
			outcome: Outcome,
			provider: Draft.provider,
			model: Draft.model,
			digest: { kept: Draft.digest.kept, collapsed: Draft.digest.collapsed },
			views: Draft.views,
			operations: Draft.operations,
			applied: Draft.applied,
			refused: Draft.refused.map((Refusal) => ({
				skill: Refusal.operation.skill,
				rule: Refusal.rule,
				detail: Refusal.detail,
			})),
			writes: Draft.writes,
			ledger: Draft.ledger,
			snapshot: Draft.snapshot,
			...(Detail === "" ? {} : { detail: Detail }),
		});
		const Result: ReviewResult = {
			outcome: Outcome,
			applied: Draft.applied,
			refused: Draft.refused,
			report: Report_,
			...(Detail === "" ? {} : { detail: Detail }),
		};
		this.Ledger(
			Line(Clause(Outcome, { views: Draft.views, result: Result }, this.Knobs), this.Knobs),
		);
		return Result;
	}

	/**
	 * Whether the curator's interval has elapsed since its last persisted pass.
	 * The clock is the store's (`Function/Usage`), never a field of this instance,
	 * so a restart does not reset it.
	 */
	private async Due(): Promise<boolean> {
		// The store is the clock's home, so the check waits for its one load: the
		// detached load in the constructor may not have finished on a fast restart,
		// and an unloaded store reads as "never curated", which would run a pass on
		// every restart - the exact failure this persistence exists to stop.
		await this.Usage.Load();
		const Last = this.Usage.CuratedAt();
		if (Last === null) {
			// The first pass anchors the clock; there is no earlier pass to measure.
			return true;
		}
		return Date.now() - Last >= this.Knobs.curateIntervalHours * 3_600_000;
	}

	/** One idle edge: the review, then the curator when its interval is due. */
	private async Edge(Agent: unknown): Promise<void> {
		await this.Trigger(Agent);
		switch (true) {
			case !this.Knobs.enabled:
				return;
			case !(await this.Due()):
				return;
			default:
				break;
		}
		await this.Curate();
	}

	/**
	 * The filesystem seam (`ctx.fs`). `Context.get` answers `undefined` when the
	 * provider is not mounted, so the presence check is explicit and the absence
	 * is NOT a silent skip: an absent provider becomes the seam that refuses every
	 * call, and the fence already has the class for a seam it cannot use - its own
	 * `failed` arm, whose detail is the error's clause
	 * (`Function/Write.ts:325-327`) - while every leaf that catches reports its
	 * own failure class. Nothing is quietly treated as absent.
	 *
	 * The value that remains is the real `FileSystem`, and its seven members are
	 * checked structurally from here rather than cast: `resolve`, `stat`,
	 * `readText`, `listDir`, `writeText`, `editText` and `contains` all match,
	 * because a branded key is still a `string`, a narrower result shape is still
	 * that shape, and a method may drop its optional trailing arguments.
	 */
	private Seam(): Seam {
		const Given = this.Context.get("fs");
		if (Given === undefined) {
			return Absent;
		}
		return Given;
	}

	/** The catalog (`ctx.skills`); a missing provider surfaces as a caught throw. */
	private Skills(): SkillsSlice {
		return this.Context.get("skills");
	}

	/** The model service, or undefined when it is absent, which is the `no-llm` class. */
	private Llm(): LlmSlice | undefined {
		const Given = this.Context.get("llm");
		return typeof Given?.stream === "function" ? Given : undefined;
	}

	/** Where the catalog is listed from: the agent's working directory, else the corpus root. */
	private async Where(Agent: Agent, Signal: AbortSignal): Promise<CatalogOptions> {
		const Working: WorkingDirectorySlice | undefined = this.Context.get("workingDirectory");
		if (Working === undefined || typeof Working.ensure !== "function") {
			return { cwd: Expand(this.Knobs.skillsRoot), signal: Signal };
		}
		try {
			return { cwd: await Working.ensure(Agent, Signal), signal: Signal };
		} catch {
			return { cwd: Expand(this.Knobs.skillsRoot), signal: Signal };
		}
	}

	/** The catalog index; a provider that rejects is an empty index, never a failed run. */
	private async Index(Where: CatalogOptions): Promise<readonly string[]> {
		try {
			return await Catalog(this.Skills(), Where);
		} catch {
			return [];
		}
	}

	/** One catalog lookup; a provider that rejects is a name the catalog does not resolve. */
	private async Lookup(Name: string, Where: CatalogOptions): Promise<LoadedSkill | undefined> {
		try {
			return await this.Skills().get(Name, Where);
		} catch {
			return undefined;
		}
	}

	/** One path's text; an absent or unreadable file is null, which is the `absent` case. */
	private async Body(Absolute: string): Promise<string | null> {
		try {
			return await Text(this.Seam(), Absolute);
		} catch {
			return null;
		}
	}

	/** Drop the catalog cache after a mutation, so the next read sees the new bytes. */
	private Refresh(): void {
		try {
			this.Skills().invalidateCache();
		} catch {
			/* the catalog may not be loaded yet */
		}
	}

	/** The judge's read-only corpus view, over the evidence one run gathered. */
	private CorpusView(Evidence_: Evidence): Corpus {
		return {
			resolve: (Name: string): string | null => {
				const Found = Evidence_.skills.get(Name) ?? null;
				if (Found === null) {
					return null;
				}
				return typeof Found.path === "string"
					? Found.path
					: Path.join(Found.resourceBase.path, "SKILL.md");
			},
			body: (Name: string): string | null => Evidence_.skills.get(Name)?.content ?? null,
			carried: (Name: string): string | null => Evidence_.bodies.get(Name) ?? null,
			support: (Name: string, FilePath: string): string | null =>
				Evidence_.supports.get(Support(Name, FilePath)) ?? null,
			record: (Name: string): UsageRecord | null => this.Usage.Get(Name) ?? null,
			contains: (Parent: string, Child: string): boolean => Contained(Parent, Child),
		};
	}
}

/**
 * The compiled package version (Source/Variable/Version, built in by the ESBuild define)
 * - NOT a loader key: the contract's names are unchanged (the class form's default
 * export with static inject/Config), and Version is a standalone named export, not on
 * the class (`Classic/packages/plugin-dsh-lesson-review/Source/Library.ts:696-701`).
 */
export { Version };
