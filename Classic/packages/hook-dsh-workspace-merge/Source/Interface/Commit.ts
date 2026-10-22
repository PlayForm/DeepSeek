// Commit - the result of one commit call (Interface/Commit): the batch
// id, the batch-level status, and the per-file replies. The batch-level
// status is `rejected` when the atomic gates refused the whole batch
// (the per-file replies then all say `rejected` with the gate reason),
// `partial` when the batch was interrupted (recovery-required replies
// present), `applied` otherwise.
import type Reply from "@Interface/Reply.js";

export default interface Commit {
	id: string;
	status: "applied" | "partial" | "rejected";
	replies: Reply[];
	/** The gate reason when the batch was rejected. */
	reason?: string;
}
