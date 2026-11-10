/**
 * @module FileCallRow
 *
 * One CostFileCallRow per call of one conversation that allocated money to one
 * file: the call's identity in the conversation grain, the pricing facts, the
 * money and tokens, and whether the call touched the file.
 *
 * @remarks
 *
 * The row is the file-scoped call read, the second level of the
 * file-to-conversation-to-call product surface. The money rounds to six
 * decimals, so a call row agrees with the conversation row above it and with
 * the file row of the session reader; `stage` stays null when the call
 * recorded no touch (the context-only case) or a touch the ledger left
 * unclassified, and `touched` is the one evidence fact the caller renders a
 * label from - a touched call paid the file's direct share, a carried call paid
 * only the amortized context share.
 */
export default interface CostFileCallRow {
    /**
     * The ledger's own call row id.
     */
    callId: number;
    /**
     * The conversation turn the call ran in.
     */
    turn: number;
    /**
     * The step of that turn the call ran in.
     */
    step: number;
    /**
     * The call's own instant, in epoch milliseconds.
     */
    at: number;
    /**
     * The provider that priced the call.
     */
    provider: string;
    /**
     * The model that priced the call.
     */
    model: string;
    /**
     * The direct money the call allocated to the file.
     */
    direct: number;
    /**
     * The amortized money the call allocated to the file.
     */
    amortized: number;
    /**
     * The direct and amortized money summed.
     */
    total: number;
    /**
     * The call's uncached input tokens.
     */
    input: number;
    /**
     * The call's output tokens.
     */
    output: number;
    /**
     * The call's cache-read tokens.
     */
    cacheRead: number;
    /**
     * The call's cache-write tokens.
     */
    cacheWrite: number;
    /**
     * The stage the file reached in that call, null when no touch.
     */
    stage: string | null;
    /**
     * Whether the call touched the file or only carried it.
     */
    touched: boolean;
}
