export default interface Decision {
    /** The proposal id. */
    proposal: string;
    /** The outcome. */
    outcome: "approved" | "denied" | "expired";
    /** Who decided. */
    by: "user" | "policy";
    /** When (epoch ms). */
    at: number;
}
