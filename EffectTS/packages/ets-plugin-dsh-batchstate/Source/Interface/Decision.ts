// Decision - the canonical batch decision as it arrives through the harness
// inbox (the batch contract of PASS-ON-AND-INGESTER.md section 2). Declared
// structurally (the self-contained rule - the decision hook is not imported).
// The board only needs the outcome; the by/at fields are carried so the
// ledger line can name the decider.
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
