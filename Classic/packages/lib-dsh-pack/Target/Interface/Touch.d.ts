/**
 * @module Touch
 *
 * One previous tool call that named a path, the fold unit of the session
 * history: the sequence number (the call's order), the normalized path it
 * touched and the tool that touched it.
 *
 * @remarks
 *
 * Every suggester derives its candidates by folding these instead of reading a
 * literal pack.
 */
export default interface Touch {
    /**
     * The call's position in the session history.
     */
    readonly seq: number;
    /**
     * The normalized path the call named.
     */
    readonly path: string;
    /**
     * The tool that made the call ("" when the event carries no name).
     */
    readonly tool: string;
}
