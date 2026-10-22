export default interface Config {
    /** The durable ledger file (one log per module). */
    logFile: string;
    /** Ledger enabled - write the durable log file. */
    log: boolean;
    /** The master switch - the IDLE-forever posture: false by default. */
    enabled: boolean;
    /** The KV domain name. */
    domain: string;
    /** The ring bound. */
    maxStamps: number;
    /** The optional allowlist; empty means every path. */
    include: string[];
    /** The excluded path patterns. */
    exclude: string[];
}
