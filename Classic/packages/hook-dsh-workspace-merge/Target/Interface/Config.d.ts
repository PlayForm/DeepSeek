export default interface Config {
    /** The IDLE-forever switch: false means disabled, wired to nothing. */
    enabled: boolean;
    /** The hook's own KV domain name. */
    domain: string;
    /** The atomicity mode: "all-or-nothing" (default) rejects the whole
     *  batch on any gate failure and marks the remainder of an interrupted
     *  batch recovery-required; "survivors" continues past per-file
     *  failures and reports per-file replies. */
    mode: "all-or-nothing" | "survivors";
    /** The maximum number of files in one batch (a gate). */
    maxFiles: number;
    /** The maximum total bytes in one batch (a gate). */
    maxTotalBytes: number;
    /** The hook's own ledger file (one log per module). */
    logFile: string;
}
