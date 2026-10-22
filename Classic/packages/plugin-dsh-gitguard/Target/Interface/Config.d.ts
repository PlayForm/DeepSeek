export default interface Config {
    /** The durable ledger file (one log per module). */
    logFile: string;
    /** Ledger enabled - write the durable log file. */
    log: boolean;
    /** The master switch - the IDLE-forever posture: false by default. */
    enabled: boolean;
    /** The deny-list: the git subcommands that are always refused
     *  (replaces the default list when set). */
    denyPatterns: string[];
    /** The allow-list: the git subcommands that pass even when deny-listed
     *  (the read-only checks + fetch). */
    allowPatterns: string[];
    /** Strict mode: deny EVERY git command (not just the deny-list). */
    strict: boolean;
    /** The paths the guard ignores (the factory's segment match). */
    exclude: string[];
}
