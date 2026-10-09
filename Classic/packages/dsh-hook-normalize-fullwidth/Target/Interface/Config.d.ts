export default interface Config {
    /** Ledger enabled — write the durable log file (volatile). */
    log: boolean;
    /** Ledger file — the fullwidth ledger, separate from the family's logs (volatile). */
    logFile: string;
    /** Normalize `reasoning-delta` chunks and the assembled ReasoningBlock too. */
    normalizeReasoning: boolean;
    /** IMPLEMENTED (default OFF): when on, the tool-call argumentsDelta and
     *  the assembled ToolCallBlock.arguments are rewritten by the transform
     *  too (execution-critical raw JSON — enabling it is the user's accepted
     *  risk; this profile's patch yml enables it). */
    normalizeToolArguments: boolean;
}
