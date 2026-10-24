// Proposal - the batch contract the ingester APPLIES (plan section 2). The
// same shape the pass-on produces and the decision hook records; declared
// structurally (the self-contained rule - no sibling imports).
//
// Only the fields the apply path READS are declared: the id (the journal
// key), the targets (the version fence), the operations (the literal
// find/replace), the expiry (the pre-apply check) and the origin (the
// feedback outcome's session). The rest of the contract travels beside them
// and is simply not read here.
export default interface Proposal {
	/** Stable, content-derived id. */
	id: string;
	/** The resolved targets: path, version, why. */
	targets: import("./Target.js").default[];
	/** The deterministic transforms per target. */
	operations: import("./Operation.js").default[];
	/** When the proposal expires (epoch ms). */
	expiresAt: number;
	/** The agent whose inbox carried the proposal (the outcome's session);
	 *  absent when the producer could not resolve one. */
	origin?: string | undefined;
}
