// Binding - the approval record (Interface/Binding): one candidate bound to
// one human decision. The decision is the Commitment (who accepted
// responsibility - NOT the authorization itself) plus the lifecycle state the
// AuthorizationDecision derives from.
export default interface Binding {
	/** The binding id, `ap-<sequence>` - assigned in bind order. */
	id: string;
	/** The exact candidate this binding covers. */
	path: string;
	fingerprint: string;
	version: string;
	/** The constraints that travel with the approval. */
	constraints: string[];
	/** The human-readable summary captured at bind time. */
	summary: string;
	/** The lifecycle state of the decision. */
	decision: "pending" | "approved" | "denied" | "rejected" | "revoked" | "invalidated";
	/** Who accepted responsibility (the Commitment; absent while pending). */
	committedBy: string | undefined;
	/** The plugin's own monotonic sequence (never a wall clock). */
	sequence: number;
}
