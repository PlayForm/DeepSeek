/**
 * @module Trigger
 *
 * The verdict the idle edge gets back.
 *
 * @remarks
 *
 * The twelve outcome classes live here rather than beside the review because the verdict
 * is where the pipeline stops: every gate that can end a run before the model does, and
 * every way the model's own run can end, is one arm of this union. `due` is a separate
 * fact from `outcome` on purpose - a run that is due and then finds the agent busy is
 * not the same event as one that never came due, and the ledger tells those apart.
 */

/**
 * The closed twelve-class outcome set.
 */
export type Outcome =
	| "disabled"
	| "below-threshold"
	| "capped"
	| "busy"
	| "no-llm"
	| "no-route"
	| "empty-transcript"
	| "model-failed"
	| "unparsable"
	| "nothing"
	| "refused"
	| "applied";

/**
 * The trigger's answer: it never throws, and it is always one class.
 */
export interface Trigger {
	/**
	 * The class the run ended in; exactly one of the twelve.
	 */
	readonly outcome: Outcome;

	/**
	 * Whether the iteration counter said a review was due.
	 */
	readonly due: boolean;

	/**
	 * The counter's value at the moment of the verdict.
	 */
	readonly count: number;

	/**
	 * The session's spent write count, so the next run can prove the cap.
	 */
	readonly writes: number;
}
