export default interface Stamp {
    /** The path as the event carried it (`displayPath` - the model-facing form). */
    path: string;
    /** The observed version token, verbatim; "absent" for an absent observation. */
    version: string;
    /** How the stamp was recorded: the fs/observed event, or a manual call. */
    origin: "fs/observed" | "manual";
    /** The plugin's own monotonic sequence (never a wall clock). */
    sequence: number;
}
