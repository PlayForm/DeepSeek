// AuditLine - one accountability record (the audit's storage domain): one
// node of the traceability graph, recorded as an event line.
//
// THE INTENT-MODEL SEMANTICS (the critique round 5, binding): the audit
// lines are the OutcomeEvidence on the traceability graph
// (Announcement -> Interpretation -> IntentRevision -> Commitment ->
// PlanRevision -> ProposedChange -> AuthorizationDecision ->
// ExecutionAttempt -> OutcomeEvidence -> IntentAssessment) - the
// accountability is the graph's record; the IntentAssessment closes the
// loop against the IntentSpecification's satisfaction contract.
//
// THE RECURSION-PREVENTION LAW (the family map, binding): every event
// carries the operation identifier, the parent identifier, and the event
// category - so an audit line never triggers an unbounded chain of audit
// lines: the chain is bounded by the parent pointers.
export default interface AuditLine {
	/** The line's own id: `a<sequence>` (the plugin's monotonic counter). */
	id: string;
	/** The operation identifier this line belongs to. */
	operation: string;
	/** The parent operation identifier (the chain's parent pointer). */
	parent: string;
	/** The event category - one node kind of the traceability graph. */
	category:
		| "announcement"
		| "interpretation"
		| "intent-revision"
		| "commitment"
		| "plan-revision"
		| "proposed-change"
		| "authorization"
		| "execution-attempt"
		| "outcome-evidence"
		| "intent-assessment";
	/** The subject path of the event ("" for pathless events). */
	path: string;
	/** The outcome of the event. */
	outcome: "success" | "failure" | "conflict" | "pending" | "refused";
	/** The assessment detail: for an intent-assessment line, whether the
	 *  IntentSpecification was satisfied ("" otherwise). */
	assessment: string;
	/** The line's sequence (the plugin's own monotonic counter, never a wall
	 *  clock). */
	sequence: number;
	/** Epoch ms when the event happened. */
	at: number;
}
