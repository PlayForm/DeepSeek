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
