export default interface Reply {
    /** The file the reply is about. */
    path: string;
    /** The reply status (see the header). */
    status: "applied" | "conflict" | "denied" | "rejected" | "recovery-required" | "outcome-unknown";
    /** The fresh version after an applied write. */
    version?: string;
    /** The fence the operation carried (conflict reporting). */
    expected?: string;
    /** The version actually observed (conflict reporting). */
    observed?: string;
    /** The reason for denied/rejected/outcome-unknown. */
    reason?: string;
}
