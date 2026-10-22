export default interface Check {
    /** Whether any binding covers this path + fingerprint. */
    bound: boolean;
    /** The decision the check derives. `approved` ONLY when an approved
     *  binding covers the exact fingerprint AND the version is unchanged. */
    decision: "approved" | "unbound" | "mismatched" | "pending" | "denied" | "rejected" | "revoked" | "invalidated" | "stale";
    /** The binding id when one was found. */
    id: string | undefined;
    /** The honest reason. */
    reason: string;
}
