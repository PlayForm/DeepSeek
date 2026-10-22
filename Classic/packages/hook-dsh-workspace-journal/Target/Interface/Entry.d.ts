export default interface EntryRecord {
    /** The batch the entry belongs to. */
    batchId: string;
    /** The file path (as the batch addressed it). */
    path: string;
    /** "present" - the file existed with `content` and `version`;
     *  "absent" - the file did not exist, and the revert removes it. */
    state: "present" | "absent";
    /** The version token observed before the write ("absent" for an absent file). */
    version: string;
    /** The pre-image content (empty when absent or truncated). */
    content: string;
    /** True when the pre-image exceeded maxEntryBytes and was not stored. */
    truncated: boolean;
    /** Epoch ms when the entry was captured. */
    at: number;
}
