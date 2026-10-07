export default interface Config {
    /** Ledger enabled - write the durable log file (volatile). */
    log: boolean;
    /** Ledger file - the file-flavor ledger, separate from the family's logs (volatile). */
    logFile: string;
    /** The dash replacement - ASCII hyphen-minus by default (volatile). */
    replacement: string;
}
