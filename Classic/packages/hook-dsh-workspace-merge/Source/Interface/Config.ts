// Config - the validated shape the Schemastery schema (Variable/Config.ts)
// produces for the merge hook: every field is volatile. The contract is
// Documentation/Plans/Workspace-Family/MERGE.md.
import type { Allowlist } from "@playform/plugin-dsh-factory";

export default interface Config {
	/** The IDLE-forever switch: false means disabled, wired to nothing. */
	enabled: boolean;
	/** The hook's own KV domain name. */
	domain: string;
	/** The atomicity mode: "all-or-nothing" (default) rejects the whole
	 *  batch on any gate failure and marks the remainder of an interrupted
	 *  batch recovery-required; "survivors" continues past per-file
	 *  failures and reports per-file replies. */
	mode: "all-or-nothing" | "survivors";
	/** The maximum number of files in one batch (a gate). */
	maxFiles: number;
	/** The maximum total bytes in one batch (a gate). */
	maxTotalBytes: number;
	/** The per-action allowlist (D6) - the shared factory block. The commit
	 *  is the hook's gated action: `commit` defaults to `approve`, so a batch
	 *  is held before any gate and any write. A resolved pack's `policy`
	 *  section overrides it per action. */
	policy: Allowlist;
	/** The hook's own ledger file (one log per module). */
	logFile: string;
}
