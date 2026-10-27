import type Reply from "@Interface/Reply.js";
export default interface Commit {
    id: string;
    status: "applied" | "partial" | "rejected";
    replies: Reply[];
    /** The gate reason when the batch was rejected. */
    reason?: string;
}
