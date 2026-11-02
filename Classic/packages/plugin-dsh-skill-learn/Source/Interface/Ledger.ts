// Ledger - one row of the audit ledger, which is also the revert handle.
//
// A row is append-only and self-sufficient: it names content addresses, and the
// blobs those addresses point at are the content, so a revert never has to
// guess what a file looked like before. That is why the row is written after
// the bytes are captured and why an append failure only logs - the write it
// describes has already happened, so refusing the write because the record
// failed would trade a durable change for a missing note.
//
// The two manifests are deltas: a path whose hash is identical on both sides is
// dropped, and a path present on one side only is kept, which is how a creation
// and a removal stay visible while an unchanged sibling disappears.
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
