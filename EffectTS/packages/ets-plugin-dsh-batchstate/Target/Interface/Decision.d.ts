export default interface Decision {
    /** The proposal id the decision names. */
    proposal: string;
    /** The recorded outcome. */
    outcome: "approved" | "denied" | "expired";
    /** Who decided. */
    by: "user" | "policy";
    /** When (epoch ms). */
    at: number;
}
