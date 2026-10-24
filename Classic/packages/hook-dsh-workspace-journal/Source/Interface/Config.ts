// Config - the validated plugin-config shape the loader hands to `apply`.
// Cordis validates the exported Schemastery schema while the plugin loads and
// fills every default, so `apply` receives a plain object of exactly this
// shape. The schema that produces it lives in Variable/Config.ts.
//
// EVERY field is volatile (hot-editable without remounting): the loader hands
// them to apply as stable `{ get }` references and the factory's State
// builder unwraps them and refreshes them in place on loader/volatile.
import type { Allowlist } from "@playform/plugin-dsh-factory";

export default interface Config {
	/** Ledger enabled - write the durable log file (the shared `log` cell). */
	log: boolean;
	/** Ledger file - the plugin's own ledger, separate from the family's logs. */
	logFile: string;
	/** Master switch - every listener no-ops to a passthrough when false. */
	enabled: boolean;
	/** The KV domain name - the plugin's own domain (workspace_journal). */
	domain: string;
	/** The maximum number of batch records kept in the bounded ring. */
	maxBatches: number;
	/** The maximum size in bytes of one stored pre-image; larger pre-images
	 *  are recorded truncated and their revert is skipped with a ledger line. */
	maxEntryBytes: number;
	/** The excluded path patterns (the factory's segment match). */
	exclude: string[];
	/** The per-action allowlist (D6) - the shared factory block. The revert is
	 *  the hook's gated action: `write` defaults to `approve`, so a revert is
	 *  held before any file is touched. A resolved pack's `policy` section
	 *  overrides it per action. */
	policy: Allowlist;
}
