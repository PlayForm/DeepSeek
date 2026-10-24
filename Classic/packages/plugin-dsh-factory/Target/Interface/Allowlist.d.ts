export default interface Allowlist {
    /** Read-only inspection of the workspace: automatic. */
    read: "auto" | "approve";
    /** Building or refreshing the index: automatic. */
    index: "auto" | "approve";
    /** Recording a decision, an outcome or a journal entry: automatic. */
    record: "auto" | "approve";
    /** Emitting a suggestion or a note: automatic. */
    suggest: "auto" | "approve";
    /** Writing a file: waits for approval (unless the pack says otherwise). */
    write: "auto" | "approve";
    /** Committing a batch of writes: waits for approval. */
    commit: "auto" | "approve";
    /** Spawning an agent or starting a job: waits for approval. */
    spawn: "auto" | "approve";
    /** Sending a message to another agent: automatic inside the session. */
    message: "auto" | "approve";
}
