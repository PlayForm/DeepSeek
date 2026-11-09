/**
 * @module Commit
 *
 * The result of one commit call: the batch id, the batch-level status, and
 * the per-file replies.
 *
 * @remarks
 * The batch-level
 * status is `rejected` when the atomic gates refused the whole batch
 * (the per-file replies then all say `rejected` with the gate reason),
 * `partial` when the batch was interrupted (recovery-required replies
 * present), `applied` otherwise.
 */
import type Reply from "./Reply.js";
export default interface Commit {
    /**
     * The batch id (caller-supplied or generated `batch-<seq>`).
     */
    id: string;
    /**
     * The batch-level status: `applied`, `partial`, or `rejected`.
     */
    status: "applied" | "partial" | "rejected";
    /**
     * The per-file replies, one per operation.
     */
    replies: Reply[];
    /**
     * The gate reason when the batch was rejected.
     */
    reason?: string;
}
