export default interface Config {
    /** The durable ledger file (one log per module). */
    logFile: string;
    /** Ledger enabled - write the durable log file. */
    log: boolean;
    /** The master switch - the IDLE-forever posture: false by default. */
    enabled: boolean;
    /** The default lease TTL (ms). */
    defaultTtlMs: number;
    /** The lease ceiling per holder. */
    maxLeasesPerHolder: number;
    /** The capability ceiling per holder. */
    maxCapabilitiesPerHolder: number;
    /** The revocation grace (ms): how long a revoked capability still
     *  shields its resource's promote protection. */
    revocationGraceMs: number;
    /** The policy table (rules per resource kind). */
    policy: import("./Policy.js").default[];
}
