/**
 * @module Review
 *
 * The review's input, its refusals, and its result record.
 *
 * @remarks
 * The agent is typed `unknown` on purpose: this interface package must not take a type
 * dependency on the agent package, and the service is the single place that narrows it
 * to the surface it reads (the route, the session, the maintenance claim). The input
 * carries the signal because a review that loses its agent must stop between the two
 * model calls, not after them.
 *
 * The rule ids are the judge's closed vocabulary, and they live here because the refusal
 * is part of the result: the interface layer owns the words, the judge owns the
 * evaluation, and the ledger prints the id it was handed.
 */
import type { Operation } from "@Interface/Operation.js";
import type { Outcome } from "@Interface/Trigger.js";

/** One review request, from the idle edge. */
export interface ReviewInput {
	/** The agent whose session is reviewed; narrowed by the service. */
	readonly agent: unknown;

	/** The maintenance signal; aborting it must stop the run between calls. */
	readonly signal: AbortSignal;

	/** Why the review was requested, when it was requested by name. */
	readonly reason?: string;
}

/** The sixteen ids a judge rule can refuse an operation with. */
export type ReviewRule =
	| "operation-known"
	| "name-grammar"
	| "target-absent"
	| "target-present"
	| "body-carried"
	| "anchor-unique"
	| "anchor-changed"
	| "frontmatter-valid"
	| "description-present"
	| "support-path"
	| "never-agreement"
	| "never-archive"
	| "narrative-free"
	| "negative-claim"
	| "duplicate-rule"
	| "size-bound";

/** One refusal: the operation, the rule that stopped it, and the rule's string. */
export interface ReviewRefusal {
	/** The refused operation, as parsed. */
	readonly operation: Operation;

	/** The rule id; the first one in a run is the id the ledger names. */
	readonly rule: ReviewRule;

	/** The byte-stable refusal string the report and the ledger detail carry. */
	readonly detail: string;
}

/** The result of one review. */
export interface ReviewResult {
	/** The class the run ended in; exactly one of the twelve. */
	readonly outcome: Outcome;

	/** The skills whose bytes changed, in the order they were written. */
	readonly applied: readonly string[];

	/** Every operation the judge or the fence refused. */
	readonly refused: readonly ReviewRefusal[];

	/** The report directory; empty when no report was written. */
	readonly report: string;

	/** One clause of detail for the ledger: a failure's cause, a drift, a skip. */
	readonly detail?: string;
}
