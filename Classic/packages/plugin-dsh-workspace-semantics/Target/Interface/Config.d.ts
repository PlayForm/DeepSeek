export default interface Config {
    /** The durable ledger file (one log per module). */
    logFile: string;
    /** Ledger enabled - write the durable log file. */
    log: boolean;
    /** The master switch - the IDLE-forever posture: false by default. */
    enabled: boolean;
    /** The KV domain name. */
    domain: string;
    /** The maximum number of built models kept in the index. */
    maxEntries: number;
    /** The excluded path patterns (no model is built for a matched path). */
    exclude: string[];
}
