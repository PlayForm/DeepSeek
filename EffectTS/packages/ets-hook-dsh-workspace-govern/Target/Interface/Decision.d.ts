export default interface Decision {
    /** "pass" | "deny" | "escalate" - deny and escalate return a waterfall
     *  decision downstream; pass returns the downstream decision unchanged. */
    decision: "pass" | "deny" | "escalate";
    /** The human-readable reason (the deny / escalate reason text). */
    reason: string;
    /** The per-obligation outcomes: satisfied | denied | n/a | recovery. */
    obligations: import("@Interface/Check.js").Obligations;
    /** The proposal the decision evaluated (echoed for the ring). */
    operation: string;
}
