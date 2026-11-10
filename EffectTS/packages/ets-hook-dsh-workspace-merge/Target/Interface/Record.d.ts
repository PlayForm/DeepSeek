/**
 * @module Record
 *
 * One persisted batch record: what the merge wrote, per file, with the
 * per-file replies.
 *
 * @remarks
 * This is the journal the recovery domain reads later - the record is
 * stored in the hook's own KV domain at every commit, keyed by the batch
 * id.
 */
import type Reply from "./Reply.js";
export default interface Record {
    id: string;
    status: "applied" | "partial" | "rejected";
    sequence: number;
    replies: Reply[];
}
