// Candidate - the EXACT change set an approval binds to (Interface/Candidate).
// The exact-approval semantics (APPROVE.md, the Representation-First
// research): the human approves the CONCRETE candidate - identified by its
// path, the content fingerprint of the change set, and the file version
// observed at the approval - never a fuzzy intent. A different fingerprint or
// a different version is a DIFFERENT candidate and never matches this
// approval.
export default interface Candidate {
	/** The path the change set touches (the model-facing form). */
	path: string;
	/** The content fingerprint of the exact change set (the caller computes
	 *  it - the graph owns content hashes; the approve only binds). */
	fingerprint: string;
	/** The file version observed when the candidate was prepared. */
	version: string;
	/** The constraints that travel with the approval (at least one when
	 *  config `requireConstraints` is true). */
	constraints: string[];
	/** The human-readable summary of the change set. */
	summary: string;
}
