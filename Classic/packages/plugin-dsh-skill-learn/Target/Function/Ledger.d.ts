import type Configuration from "../Interface/Configuration.js";
import type { LedgerEvidence, LedgerRow } from "../Interface/Ledger.js";
/**
 * One file a mutation touched, with the text it held; null text means it did not exist.
 */
export interface Touched {
    /**
     * The absolute path the bytes belong to.
     */
    readonly path: string;
    /**
     * The file's text, or null when the file did not exist on that side of the mutation.
     */
    readonly text: string | null;
}
/**
 * One mutation to record: what it did, to which skill, and the texts on both sides.
 */
export interface Mutation {
    readonly actor: "curator" | "agent" | "user";
    readonly action: "create" | "patch" | "support" | "archive" | "restore" | "revert";
    readonly skill: string;
    readonly evidence: LedgerEvidence;
    /**
     * The files as they were, with their text.
     */
    readonly before: readonly Touched[];
    /**
     * The files as they are, with their text.
     */
    readonly after: readonly Touched[];
}
/**
 * The append's answer: the row id, or why there is none.
 */
export interface Appended {
    /**
     * The twelve hex characters that name the row, or "" when the append failed.
     */
    readonly id: string;
    /**
     * Why the append failed, for the one log line; absent on success.
     */
    readonly error?: string;
}
/**
 * Store one text as a content-addressed blob and return its sha256. Identical
 * bytes cost one file, so a hundred rows touching the same unchanged file cost
 * one blob (tools/skill_ledger.py:137-146). The write lands through a temporary
 * file and a rename, so a crash mid-capture cannot leave a half blob under the
 * hash of its whole content.
 */
export declare const Capture: (Text: string, Configuration_: Configuration) => Promise<string>;
/**
 * One blob's text, or null when the store does not hold it or the key is not a digest.
 */
export declare const Blob: (Digest: string, Configuration_: Configuration) => Promise<string | null>;
/**
 * Every row the ledger holds, oldest first. A line that does not parse is skipped
 * rather than fatal: a crash mid-append leaves a partial tail, and losing the
 * audit tail must not cost the revert path its whole history.
 */
export declare const Rows: (Configuration_: Configuration) => Promise<readonly LedgerRow[]>;
export default _default;
/**
 * Append one row, capturing its blobs first. Never throws, and never blocks a write.
 */
declare function _default(Mutation_: Mutation, Configuration_: Configuration): Promise<Appended>;
