// Review - the review's INPUT snapshot and its result record.
//
// THE SNAPSHOT IS PASSED IN, never re-read: the caller hands the service the
// conversation it already holds, exactly as the Hermes fork receives
// `messages_snapshot`. Two consequences, both deliberate:
//
//   1. the review can never race the live turn's own log writes, and
//   2. the service is testable without a session (the smokes pass a literal
//      snapshot), while the ONE place that knows how to project a live
//      session into messages is the caller's (`Function/Snapshot`, whose
//      surface read is the integration seam named in SCHEME §6).
export interface ReviewMessage {
	/** The message role (`user`, `assistant`, `tool`, `system`). */
	role: string;
	/** The model-facing text of the message. */
	text: string;
}

/** One review request. */
export interface ReviewInput {
	/** The agent the review belongs to (read for its route only). */
	Agent?: unknown;
	/** The session id, for the report and the ledger. */
	Session?: string;
	/** The conversation snapshot to review. */
	Messages: readonly ReviewMessage[];
	/** The turn's cancellation signal (a preempted review must abort). */
	Signal?: AbortSignal;
	/** An explicitly requested review (`/refine`): focus text, and attended. */
	Focus?: string;
}

/** Why a review ended the way it did. */
export type Outcome =
	/** Accepted operations landed in the corpus. */
	| "applied"
	/** Accepted operations were queued (the shipped `write: approve`). */
	| "proposed"
	/** The reviewer said `Nothing to save.`. */
	| "nothing"
	/** No review was possible (disabled, no model route, no llm service). */
	| "unavailable"
	/** The reply could not be parsed, or the model call failed. */
	| "failed";

/** The result of one review. */
export interface ReviewResult {
	/** The outcome class. */
	outcome: Outcome;
	/** The names that landed in the corpus. */
	applied: string[];
	/** The names queued for acceptance. */
	proposed: string[];
	/** The refused operations, with their rule ids. */
	rejected: { name: string; rule: string }[];
	/** The report directory (`""` when no report was written). */
	report: string;
	/** One clause of detail for the ledger (a failure's cause, a skip's reason). */
	detail?: string;
}
