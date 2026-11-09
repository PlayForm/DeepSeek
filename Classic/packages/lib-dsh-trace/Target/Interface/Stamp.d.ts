export default interface Stamp {
    /** The path as the fs/observed event carried it (`displayPath`). */
    path: string;
    /** The observed version token, verbatim; "absent" for an absent observation. */
    version: string;
    /** How the stamp was recorded ("fs/observed" or "manual"). */
    origin: string;
}
