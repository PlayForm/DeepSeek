export interface LedgerFile {
    /** The absolute path the bytes belong to. */
    readonly path: string;
    /** The content address of the bytes in the blob store. */
    readonly sha256: string;
}
/** The evidence a row carries: who, why, and which rule let it through. */
export interface LedgerEvidence {
    /** The agent id whose session produced the write; empty for a curator pass. */
    readonly session: string;
    /** The model's one sentence, or the curator's reason for a transition. */
    readonly reason: string;
    /** The judge id that accepted the write; empty when no judge ran. */
    readonly rule: string;
}
export interface LedgerRow {
    /** Twelve hex characters, unique within the ledger. */
    readonly id: string;
    /** ISO-8601 UTC, the moment the row was appended. */
    readonly ts: string;
    /**
     * Who acted; `user` is written by Revert, whose safety row and revert row record
     * that a revert is the user's action rather than the model's.
     */
    readonly actor: "curator" | "agent" | "user";
    /** The mutation kind; a revert appends its own row rather than rewriting one. */
    readonly action: "create" | "patch" | "support" | "archive" | "restore" | "revert";
    /** The skill the row is about, by frontmatter name rather than directory name. */
    readonly skill: string;
    readonly evidence: LedgerEvidence;
    /** The paths and bytes as they were; empty for a creation. */
    readonly before: readonly LedgerFile[];
    /** The paths and bytes as they are; empty only for a removal, which this release has none of. */
    readonly after: readonly LedgerFile[];
}
