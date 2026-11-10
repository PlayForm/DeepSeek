import type Reply from "./Reply.js";
/**
 * @module Record
 *
 * One persisted batch record: what the merge wrote, per file, with the
 * per-file replies.
 *
 * @remarks
 *
 * This is the journal the
 * recovery domain reads later - the record is stored in the hook's own KV
 * domain at every commit, keyed by the batch id.
 */
export default interface Record {
    /**
     * The batch id.
     */
    id: string;
    /**
     * The batch-level status: `applied`, `partial`, or `rejected`.
     */
    status: "applied" | "partial" | "rejected";
    /**
     * The hook's monotonic batch sequence.
     */
    sequence: number;
    /**
     * The per-file replies, one per operation.
     */
    replies: Reply[];
}
