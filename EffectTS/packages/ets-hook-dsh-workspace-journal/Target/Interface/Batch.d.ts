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
