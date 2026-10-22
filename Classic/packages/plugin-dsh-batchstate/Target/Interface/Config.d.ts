export default interface Config {
    /** The durable ledger file (one log per module). */
    logFile: string;
    /** Ledger enabled - write the durable log file. */
    log: boolean;
    /** The master switch - the IDLE-forever posture: false by default. */
    enabled: boolean;
    /** The batch key (multi-batch isolation). */
    batch: string;
    /** The well-known JSON state file (the plan's file-based fallback). */
    stateFile: string;
    /** The completions ring bound. */
    maxRecent: number;
}
