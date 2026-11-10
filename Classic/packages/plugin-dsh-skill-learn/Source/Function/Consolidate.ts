import Judge from "@Function/Judge.js";
import Append from "@Function/Ledger.js";
import Snapshot, { Rotate } from "@Function/Snapshot.js";
import type Usage from "@Function/Usage.js";
import Write, { type Seam } from "@Function/Write.js";
import type Configuration from "@Interface/Configuration.js";
import type {
	ConsolidationCandidate,
	ConsolidationPlan,
	ConsolidationResult,
} from "@Interface/Consolidation.js";
import type { Corpus } from "@Interface/Corpus.js";
import type { Operation } from "@Interface/Operation.js";
import type UsageRecord from "@Interface/Record.js";

/**
 * @module Consolidate
 *
 * The opt-in second half of the curator: one survey, one model call, and the same
 * fence every other write goes through.
 *
 * @remarks
 *
 * IT SHIPS OFF. `consolidate` defaults to false, which is the Hermes code default too
 * (`DEFAULT_CONSOLIDATE = False`, agent/curator.py:35); the live Hermes config on this
 * machine sets it true, and the README states that difference so it is a choice the
 * user makes rather than a surprise (SKILL-LEARN-PLUGIN.md:574-576).
 *
 * THE PLAN HAS FOUR ROWS AND NO DELETE. A row may be `keep`, `patch`, `create`, or
 * `write_file`; there is no delete row and no absorbed-into field in the schema at
 * all, so the worst outcome this pass can produce is still an archive, and a
 * hallucinated umbrella cannot become a phantom merge because no merge can be
 * expressed (SKILL-LEARN-PLUGIN.md:580-594).
 *
 * THE FIVE GUARDS (SKILL-LEARN-PLUGIN.md:582-588):
 *
 * - consolidate-enabled - `consolidate` must be true, and a dry run renders the plan
 *   without applying it
 * - consolidate-survey - an empty candidate list skips the call entirely
 * - consolidate-budget - at most `maxOperationsPerRun` rows, counted on successes
 * - consolidate-target - every writing row is judged by the same sixteen rules, so a
 *   consolidation patch IS a normal patch
 * - consolidate-snapshot - a whole-tree snapshot is taken before the first write
 *
 * READ-BEFORE-WRITE HOLDS HERE TOO, and it is the caller's job to make it possible: a
 * row that patches a skill needs that skill's body carried in the Corpus view before
 * the plan is asked for, exactly as a review patch does
 * (SKILL-LEARN-PLUGIN.md:288-297). A row whose body was not carried is refused by the
 * same J5 rule, not waved through because the pass is the curator's.
 */
/**
 * One consolidation pass's whole input.
 */
export interface Request {
	readonly store: Usage;

	/**
	 * The read-only catalog view; a patch row's body must already be carried here.
	 */
	readonly corpus: Corpus;
	readonly seam: Seam;
	readonly configuration: Configuration;

	/**
	 * Whether the pass computes the plan and applies nothing.
	 */
	readonly dryRun: boolean;

	/**
	 * The report directory, when the caller is writing one; "" otherwise.
	 */
	readonly report: string;

	/**
	 * The one model call: the nine-field survey in, the plan out, or null when the
	 * call failed or the reply did not parse.
	 */
	readonly ask: (survey: readonly ConsolidationCandidate[]) => Promise<ConsolidationPlan | null>;
}

/**
 * Whether the record is in the pass's jurisdiction: the plugin's own create, or a pin.
 */
const Eligible = (Record_: UsageRecord): boolean => Record_.createdBy === "agent" || Record_.pinned;

/**
 * The nine fields the plan is decided from (agent/curator.py:832-861).
 */
const Survey = (store: Usage): readonly ConsolidationCandidate[] => {
	const Listed: ConsolidationCandidate[] = [];
	for (const Stored of store.All()) {
		const Record_ = Stored.record;
		switch (true) {
			case !Eligible(Record_):
				continue;
			default:
				break;
		}
		Listed.push({
			name: Stored.name,
			createdBy: Record_.createdBy,
			state: Record_.state,
			pinned: Record_.pinned,
			// The store keeps no view counter, so activity is the two counters it has.
			activityCount: Record_.useCount + Record_.patchCount,
			useCount: Record_.useCount,
			patchCount: Record_.patchCount,
			lastActivityAt: Record_.lastActivityAt,
			seeded: Record_.firstSeenAt !== null,
		});
	}
	return Listed;
};

/**
 * Whether a row's action and its operation kind agree; a mismatch is a refusal, not a repair.
 */
const Agrees = (Action: string, Kind: Operation["kind"]): boolean =>
	(Action === "patch" && Kind === "patch") ||
	(Action === "create" && Kind === "create") ||
	(Action === "write_file" && Kind === "support");

/**
 * One consolidation pass: the survey, the plan, and every guard between them and the corpus.
 */
export default async (Request_: Request): Promise<ConsolidationResult> => {
	const Knobs = Request_.configuration;
	const Empty: ConsolidationResult = {
		outcome: "disabled",
		proposed: 0,
		applied: 0,
		refused: 0,
		snapshot: "",
		report: Request_.report,
	};

	// consolidate-enabled: the shipped posture is off, and off means no call at all.
	switch (true) {
		case !Knobs.consolidate:
			return Empty;
		default:
			break;
	}
	// consolidate-survey: no candidates means no model call and no cost.
	const Candidates = Survey(Request_.store);
	switch (true) {
		case Candidates.length === 0:
			return { ...Empty, outcome: "nothing" };
		default:
			break;
	}
	const Plan = await Request_.ask(Candidates);
	switch (true) {
		case Plan === null:
			return { ...Empty, outcome: "model-failed" };
		default:
			break;
	}
	const Now = new Date();
	let Applied = 0;
	let Refused = 0;
	let Proposed = 0;
	let Taken = "";
	for (const Row of Plan.rows) {
		Proposed += 1;
		switch (true) {
			case Row.action === "keep":
				continue;
			default:
				break;
		}
		const Operation_ = Row.operation;
		if (Operation_ === undefined) {
			// A writing row without an operation is a malformed plan, refused unread.
			Refused += 1;
			continue;
		}
		switch (true) {
			case !Agrees(Row.action, Operation_.kind):
				Refused += 1;
				continue;
			// consolidate-budget: counted on successes, so a refused row costs nothing.
			case Applied >= Knobs.maxOperationsPerRun:
				Refused += 1;
				continue;
			default:
				break;
		}
		// consolidate-target: the same sixteen rules the review uses, and they run on
		// a dry run too so the preview reports what a live pass would refuse.
		const Refusal = Judge(Operation_, Request_.corpus, Knobs);
		switch (true) {
			case Refusal !== null:
				Refused += 1;
				continue;
			default:
				break;
		}
		switch (true) {
			case Request_.dryRun:
				// A dry run renders the plan and applies none of it, and it takes no
				// snapshot because nothing can change (agent/curator.py:928-929). The
				// count is what WOULD land, and the caller's own flag says it did not.
				Applied += 1;
				continue;
			default:
				break;
		}
		// consolidate-snapshot: one whole-tree capture before the first write, and
		// it is best-effort, so a failed capture is reported as an empty id rather
		// than silently pretending the corpus is safe (agent/curator.py:935-942).
		switch (true) {
			case Taken !== "":
				break;
			default: {
				const Captured = await Snapshot("pre-consolidation", Request_.seam, Knobs);
				Taken = Captured.id;
			}
		}
		const Fenced = await Write({
			operation: Operation_,
			carried: Request_.corpus.carried(Operation_.skill),
			corpus: Request_.corpus,
			seam: Request_.seam,
			configuration: Knobs,
		});
		if (!Fenced.ok) {
			Refused += 1;
			continue;
		}
		await Append(
			{
				actor: "curator",
				action: Operation_.kind,
				skill: Operation_.skill,
				evidence: { session: "", reason: Row.reason, rule: "consolidate" },
				before: [{ path: Fenced.applied.path, text: Fenced.applied.before }],
				after: [{ path: Fenced.applied.path, text: Fenced.applied.after }],
			},
			Knobs,
		);
		switch (true) {
			case Operation_.kind === "create":
				Request_.store.Created(Operation_.skill, Now);
				break;
			default:
				Request_.store.Patched(Operation_.skill, Now);
				break;
		}
		Applied += 1;
	}
	switch (true) {
		case Request_.dryRun:
			break;
		default:
			await Request_.store.Save();
			// Rotation prunes the plugin's own manifests, never a skill, and never the
			// snapshot this pass just wrote (curator_backup.py:188-190).
			await Rotate(Taken === "" ? [] : [Taken], Knobs);
	}
	switch (true) {
		case Applied > 0:
			return {
				outcome: "applied",
				proposed: Proposed,
				applied: Applied,
				refused: Refused,
				snapshot: Taken,
				report: Request_.report,
			};
		case Refused > 0:
			return {
				outcome: "refused",
				proposed: Proposed,
				applied: 0,
				refused: Refused,
				snapshot: Taken,
				report: Request_.report,
			};
		default:
			return {
				outcome: "nothing",
				proposed: Proposed,
				applied: 0,
				refused: 0,
				snapshot: Taken,
				report: Request_.report,
			};
	}
};
