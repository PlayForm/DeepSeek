export default interface Journal {
    /** Lifecycle event name (the enum fixed in Function/Open's zod schema). */
    event: string;
    /** File path (or update-stage directory) the event belongs to; "" for `activated`. */
    path: string;
    /** Event payload (version token, mode, exit code, summary). */
    detail: string;
    /** Epoch ms when the event happened (preserved through the pre-open queue). */
    at: number;
}
