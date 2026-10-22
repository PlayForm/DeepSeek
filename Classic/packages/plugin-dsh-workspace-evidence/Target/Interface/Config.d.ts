export default interface Config {
    /** The durable ledger file (one log per module). */
    logFile: string;
    /** Ledger enabled - write the durable log file. */
    log: boolean;
    /** The master switch - the IDLE-forever posture: false by default. */
    enabled: boolean;
    /** The KV domain name. */
    domain: string;
    /** The maximum number of validation objects kept. */
    maxValidations: number;
    /** The excluded path patterns (an fs/observed event for a matched path
     *  triggers no invalidation). */
    exclude: string[];
}
