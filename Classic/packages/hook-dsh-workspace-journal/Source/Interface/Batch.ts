// BatchRecord - one per-batch record (the journal's storage domain): the
// batch identity, the edit-lifecycle state, and the recovery trace
// properties. The batch lifecycle follows the edit lifecycle of
// WORKSPACE-FAMILY-V4-1.md section 3.7, narrowed to the batch transaction:
//
//   applying -> verified | recovery-required | reverted
//
// `parent` carries the operation identifier of the parent step (the
// recursion-prevention law: every event carries the operation identifier,
// the parent identifier, and the category - here the category is the state
// itself). The journal is written BEFORE the batch's writes land, so a
// record found in the `applying` state at boot is, by definition, a batch
// whose writes may have landed without a seal: the honest
// recovery-required, never an invisible intermediate state.
export default interface BatchRecord {
	/** The batch identifier (the caller's transaction id). */
	batchId: string;
	/** The operation name (e.g. "workspace.commit", "batch-edit.apply"). */
	operation: string;
	/** The parent operation identifier, or "" at the top of the chain. */
	parent: string;
	/** The edit-lifecycle state of the batch transaction. */
	state: "applying" | "verified" | "recovery-required" | "reverted";
	/** The ordered file paths the batch covers. */
	files: string[];
	/** How many of the batch's observed writes the fs/observed listener has
	 *  counted so far (the recovery checkpoint: how far a crash got). */
	progress: number;
	/** Why the batch entered `recovery-required` ("" otherwise). */
	reason: string;
	/** Epoch ms when the batch was opened. */
	at: number;
}
