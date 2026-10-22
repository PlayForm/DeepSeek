// Decision - the gate's output (plan section 2, BatchDecision). Produced by
// the decision workflow (hook-dsh-batch-decision); the ingester requires it
// before applying anything.
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
