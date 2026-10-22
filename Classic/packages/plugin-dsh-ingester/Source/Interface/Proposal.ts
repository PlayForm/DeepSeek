// Proposal - the shared batch contract (plan section 2). The same shape the
// pass-on declares; the ingester consumes it after the decision.
export default interface Proposal {
	/** Stable, content-derived id. */
	id: string;
	/** The intent that produced the batch. */
	intent: { kind: string; params: Record<string, string | number | boolean> };
	/** The resolved targets: path, version, why. */
	targets: import("./Target.js").default[];
	/** The deterministic transforms per target. */
	operations: import("./Operation.js").default[];
	/** The rendered before/after, bounded. */
	preview: import("./Preview.js").default[];
	/** sha256(targets + operations + versions) - the fence. */
	digest: string;
	/** The batch's own revision. */
	revision: number;
	/** When the proposal expires (epoch ms). */
	expiresAt: number;
	/** When the proposal was prepared (epoch ms). */
	createdAt: number;
}
