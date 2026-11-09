/**
 * @module Consolidation
 *
 * The opt-in survey, the plan it produces, and the result.
 *
 * @remarks
 * The action set is closed at four and has no delete member and no absorbed-into field,
 * which is the fence holding inside the second half of the curator too: the worst
 * outcome a pass can produce is still a move into the archive, so no merge decision can
 * be hallucinated because no merge can be expressed. A row that writes carries a normal
 * operation, which is what lets the same sixteen judge rules run over a consolidation
 * patch.
 *
 * A pass with `consolidate: false` reports `disabled`, because the twelve-class set has
 * no arm for a gated half and `unavailable` is the ledger verb of the no-llm, no-route
 * and empty-transcript classes rather than a thirteenth arm.
 */
import type { Operation } from "@Interface/Operation.js";
import type { Outcome } from "@Interface/Trigger.js";

/** The four rows a consolidation plan may contain. */
export type ConsolidationAction = "keep" | "patch" | "create" | "write_file";

/** One survey row: the nine fields the plan is decided from. */
export interface ConsolidationCandidate {
	/** The skill name. */
	readonly name: string;

	/** The curation opt-in flag, which decides jurisdiction rather than authorship. */
	readonly createdBy: null | "agent" | "learn";

	/** The lifecycle state at survey time. */
	readonly state: "active" | "stale" | "archived";

	/** Whether the record is pinned, and therefore exempt from every row. */
	readonly pinned: boolean;

	/** How many recorded activities the skill has. */
	readonly activityCount: number;

	/** Observed loads through the `skill` tool. */
	readonly useCount: number;

	/** Successful writes to the skill. */
	readonly patchCount: number;

	/** The last activity stamp, or null before the first. */
	readonly lastActivityAt: string | null;

	/** Whether the record was seeded by the curator rather than observed in use. */
	readonly seeded: boolean;
}

/** One row of the plan. */
export interface ConsolidationRow {
	/** The row's action; `keep` is the only one that writes nothing. */
	readonly action: ConsolidationAction;

	/** The skill the row names. */
	readonly skill: string;

	/** The write the row proposes; absent for `keep`. */
	readonly operation?: Operation;

	/** One sentence naming why the row exists. */
	readonly reason: string;
}

/** The plan the model returns, before any guard has run. */
export interface ConsolidationPlan {
	/** The rows, in the order the model returned them. */
	readonly rows: readonly ConsolidationRow[];
}

/** The result of one consolidation pass. */
export interface ConsolidationResult {
	/** The class the pass ended in; `disabled` when `consolidate` is false. */
	readonly outcome: Outcome;

	/** Rows the plan proposed, before the budget and the judge ran. */
	readonly proposed: number;

	/** Rows applied, counted on successes rather than attempts. */
	readonly applied: number;

	/** Rows the budget, the judge, or the fence refused. */
	readonly refused: number;

	/** The snapshot taken before the first write; empty when none was taken. */
	readonly snapshot: string;

	/** The report directory; empty when no report was written. */
	readonly report: string;
}
