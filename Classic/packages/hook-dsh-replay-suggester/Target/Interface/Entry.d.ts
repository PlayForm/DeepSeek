export default interface Entry {
    /** The store's monotonic order (the KV key, the episode's anchor). */
    seq: number;
    /** The path the call named (repo-relative when the call was). */
    path: string;
    /** The family ("replay") or the intent the call was judged under ("Repeat"). */
    intent: string;
    /** The downstream decision's outcome (the tool decision's kind). */
    outcome: string;
    /** When the call was judged (epoch milliseconds). */
    at: number;
    /** The similarity key: the tool name plus the arguments JSON. */
    probe: string;
}
