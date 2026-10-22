// Reports - the service's structured return shapes (Interface/Result).
//
// RevertReport - what one `revert` did, file by file. `action` is the
// replay outcome per file:
//   * "restored"  - the pre-image was written back through the factory's
//                   version-fenced write (replaceIfVersion against the
//                   observed current version);
//   * "removed"   - the file did not exist before the batch, so it was
//                   unlinked (see Revert.ts for the unlink exemption);
//   * "conflict"  - the version fence failed: the file changed outside the
//                   batch since its write, so the pre-image is NOT applied
//                   (never a silent overwrite - the conflict is reported
//                   with the expected and observed versions);
//   * "skipped"   - no replay was attempted (a truncated pre-image, an
//                   unreadable entry, or a revert already in progress).
//
// RecoveryReport - what one `recover` pass found: the batch records that
// were still `applying` when the process restarted, marked
// `recovery-required` (the honest all-or-nothing: recoverable partial
// states, never an invisible intermediate state).
export default interface Result {
	/** One file's replay outcome. */
	files: {
		path: string;
		action: "restored" | "removed" | "conflict" | "skipped";
		reason?: string;
	}[];
}

/** A recovery pass: the batches found still `applying` at boot. */
export interface RecoveryReport {
	batchIds: string[];
}
