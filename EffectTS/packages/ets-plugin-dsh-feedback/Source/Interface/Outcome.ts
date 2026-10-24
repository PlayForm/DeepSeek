// Outcome - one batch outcome the orchestration layer reports to the council
// (the plan's deferred caller-side integration, HONEST-FEEDBACK-PLUGIN
// section 2.3). The outcome belongs to the BATCH, not to an agent's opinion,
// so it is its own record beside the blocks - the honest apply truth the
// feedback journal and summary carry:
//
//   applied   the ingester's write path applied the batch
//   rejected  the ingester refused it (a denied/expired decision, a fence)
//   denied    the user denied the proposal (no apply ran)
//   expired   the proposal expired before a decision (no apply ran)
//
// The record is appended (never rewritten) and bounded by `maxOutcomes`.
export default interface Outcome {
	/** The proposal id the outcome belongs to. */
	proposal: string;
	/** The outcome vocabulary (applied / rejected / denied / expired). */
	outcome: string;
	/** The honest one-line account (the counts, the reason). */
	detail: string;
	/** When the outcome was recorded (epoch ms). */
	at: number;
}
