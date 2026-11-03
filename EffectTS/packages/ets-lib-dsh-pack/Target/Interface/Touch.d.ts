export default interface Touch {
    /** The call's position in the session history. */
    readonly seq: number;
    /** The normalized path the call named. */
    readonly path: string;
    /** The tool that made the call ("" when the event carries no name). */
    readonly tool: string;
}
