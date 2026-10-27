export default interface Change {
    /** The batch key. */
    batch: string;
    /** The member id, the proposal id, the gate name - or "" for a
     *  whole-batch change (clear). */
    id: string;
    /** The write API that caused the change. */
    kind: "task" | "status" | "scope" | "queue" | "clear" | "proposal" | "decision" | "gate";
}
