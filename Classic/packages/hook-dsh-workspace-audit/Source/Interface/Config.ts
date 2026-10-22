// Config - the validated plugin-config shape the loader hands to `apply`.
// Cordis validates the exported Schemastery schema while the plugin loads and
// fills every default, so `apply` receives a plain object of exactly this
// shape. The schema that produces it lives in Variable/Config.ts.
//
// EVERY field is volatile (hot-editable without remounting).
export default interface Config {
	/** Ledger enabled - write the durable log file (the shared `log` cell). */
	log: boolean;
	/** Ledger file - the plugin's own ledger, separate from the family's logs. */
	logFile: string;
	/** Master switch - every listener no-ops to a passthrough when false. */
	enabled: boolean;
	/** The KV domain name - the plugin's own domain (workspace_audit). */
	domain: string;
	/** The maximum number of audit lines kept in the bounded ring. */
	maxLines: number;
	/** The excluded path patterns (the factory's segment match). */
	exclude: string[];
}
