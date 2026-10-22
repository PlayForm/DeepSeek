export default interface Change {
    /** The batch key. */
    batch: string;
    /** The member id, or "" for a whole-batch change (clear). */
    id: string;
    /** The write API that caused the change. */
    kind: "task" | "status" | "scope" | "queue" | "clear";
}
