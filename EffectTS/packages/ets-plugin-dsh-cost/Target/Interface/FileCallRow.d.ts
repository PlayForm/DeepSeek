/**
 * @module FileCallRow
 *
 * One row per call of one conversation that allocated money to one file
 * (the file-scoped call read, the second level of the
 * file-to-conversation-to-call product surface): the call's identity in the
 * conversation grain (`CallId`, `Turn`, `Step`, `At`), the provider and
 * model that priced it, the money its allocations to the file carried with
 * their sum in `Total`, the four token buckets the call reported, the stage
 * the file reached in that call, and whether the call actually touched the
 * file (`Touched`) or only carried it in its context.
 *
 * @remarks
 * The money rounds to six decimals, so a call row agrees with the
 * conversation row above it and with the file row of the report reads;
 * `Stage` stays null when the call recorded no touch (the context-only
 * case) or a touch the ledger left unclassified, and `Touched` is the one
 * evidence fact the caller renders a label from - a touched call paid the
 * file's direct share, a carried call paid only the amortized context
 * share. The field names are the twin's PascalCase, the field set and the
 * types are the Classic row's.
 */
/**
 * One call's contribution to one file.
 */
export default interface FileCallRow {
    /**
     * The call's ledger row id.
     */
    readonly CallId: number;
    /**
     * The call's turn in the conversation.
     */
    readonly Turn: number;
    /**
     * The call's step in the turn.
     */
    readonly Step: number;
    /**
     * The call's instant (epoch ms).
     */
    readonly At: number;
    /**
     * The provider that priced the call.
     */
    readonly Provider: string;
    /**
     * The model that priced the call.
     */
    readonly Model: string;
    /**
     * The direct money the call allocated to the file.
     */
    readonly Direct: number;
    /**
     * The amortized money the call allocated to the file.
     */
    readonly Amortized: number;
    /**
     * The sum of the direct and amortized money.
     */
    readonly Total: number;
    /**
     * The call's uncached input tokens.
     */
    readonly Input: number;
    /**
     * The call's output tokens.
     */
    readonly Output: number;
    /**
     * The call's cache-read tokens.
     */
    readonly CacheRead: number;
    /**
     * The call's cache-write tokens.
     */
    readonly CacheWrite: number;
    /**
     * The stage the file reached in the call (null when unclassified).
     */
    readonly Stage: string | null;
    /**
     * Whether the call touched the file or only carried it in context.
     */
    readonly Touched: boolean;
}
