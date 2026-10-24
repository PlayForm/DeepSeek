export default interface Config {
    /** Ledger enabled - write the durable log file (the shared minimal cell). */
    log: boolean;
    /** Ledger file - the comment-filter ledger, separate from the family's
     *  logs (volatile: hot-editable without a remount). */
    logFile: string;
    /** The whole filter on/off - the per-call Gate's first arm (volatile). */
    enabled: boolean;
    /** The tool names the filter may touch (structural). `read` is HERE,
     *  unlike the normalize flavors, which exempt it as byte-contracted. */
    targets: string[];
    /** The tool names that always pass by identity (structural). `read` and
     *  `ccr_retrieve` are ABSENT by design - the deliberate opposite. */
    exempt: string[];
    /** Consult the per-task intent gate stashed at agent/pre-step
     *  (volatile). */
    intent: boolean;
    /** The intent keywords (volatile): a task text containing one means the
     *  task is ABOUT comments, so the read result must stay untouched. */
    intentKeywords: string[];
    /** Append the omission notice line to a stripped result (volatile). */
    notice: boolean;
}
