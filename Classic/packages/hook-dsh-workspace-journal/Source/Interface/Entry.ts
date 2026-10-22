// EntryRecord - one per-file entry of a batch: the REVERT DATA. The caller
// (the merge step) captures the pre-image BEFORE the write lands - the
// content and the version as they were - and hands it to the journal with
// the batch's other entries, so `revert` can replay the batch backward
// (the rollback layer: every settlement is reversible, the citizen's
// pre-state is remembered - FORMS-AND-GOVERNANCE-LAYERS.md layer 4).
//
// An entry whose `content` exceeds the config's `maxEntryBytes` is stored
// with `truncated: true` and an empty `content`: the revert of that file is
// SKIPPED with a ledger line, never half-applied.
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
