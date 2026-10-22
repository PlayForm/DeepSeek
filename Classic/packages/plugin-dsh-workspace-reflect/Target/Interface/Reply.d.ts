export default interface Reply {
    status: "applied" | "conflict" | "denied" | "rejected" | "recovery-required" | "outcome-unknown";
    /** The human-readable detail (the reason for every non-applied status). */
    detail: string;
    /** The file version AFTER an applied write (the outcome's version). */
    version: string | undefined;
}
