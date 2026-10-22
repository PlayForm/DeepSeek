export default interface Config {
    /** The durable ledger file (one log per module). */
    logFile: string;
    /** Ledger enabled - write the durable log file. */
    log: boolean;
    /** The master switch - the IDLE-forever posture: false by default. */
    enabled: boolean;
    /** The default rename scope: the block span, or the whole file. */
    propagate: "block" | "file";
    /** The refusal bound on the file size. */
    maxFileBytes: number;
    /** The refusal bound on the span width. */
    maxBlockLines: number;
}
