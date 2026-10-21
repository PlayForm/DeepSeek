export default interface Config {
    /** Ledger enabled - write the durable log file (volatile). */
    log: boolean;
    /** Ledger file - the file-flavor ledger, separate from the family's logs (volatile). */
    logFile: string;
    /** The dash replacement - ASCII hyphen-minus by default (volatile). */
    replacement: string;
    /** Granular scope gates (the whole object is volatile - one leaf change
     *  commits one update whose whole object the State refreshes; only the
     *  `files` scope is consumed by this flavor, the rest ride along so one
     *  patch override drives the whole family). */
    scopes: Scopes;
    /** Tool-results exemption list (volatile): a result whose exec name is
     *  listed passes the tools/post-execute arm by identity. */
    toolResultsExempt: string[];
}
/** The granular scope gates' shape (identical in all the family's flavors). */
export interface Scopes {
    /** The text-delta text and the assembled text/reasoning blocks. */
    conversation: boolean;
    /** The reasoning-delta sub-gate (ANDed with `normalizeReasoning`). */
    reasoning: boolean;
    /** The tool-call arguments arm (OR-ed with `normalizeToolArguments`). */
    toolInput: boolean;
    /** The tools/post-execute arm (tool results in the transcript). */
    toolResults: boolean;
    /** The normalize-file tool - the only scope this flavor consumes. */
    files: boolean;
    /** The agent/pre-step arm (the incoming step batch). */
    batch: boolean;
}
