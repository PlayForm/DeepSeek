// Siblings - the STRUCTURAL shapes of the services this hook calls but does
// NOT own (PASS-ON-AND-INGESTER.md section 5: "it does not implement the
// pass-on or the ingester; it calls them"). Self-contained PoC posture: the
// shapes are declared here and resolved via Context.get at use time (the
// tool-jobs precedent - never injected, never imported from sibling
// workspace packages). An absent sibling is a silent skip plus one ledger
// line, never an error thrown into a caller.

/** The pass-on service (plugin-dsh-pass-on): proposal preparation. */
export interface PassOnService {
	prepare(input: unknown): Promise<import("./Batch.js").BatchProposal | null>;
}

/** The ingester service (plugin-dsh-ingester): the only writer. */
export interface IngesterService {
	apply(
		decision: import("./Batch.js").BatchDecision,
	): Promise<import("./Batch.js").BatchResult | null>;
}

/** The approval service (ctx.approval): the policy surface for the
 *  require-user path, when a host provides one. */
export interface ApprovalService {
	request(payload: unknown): Promise<{ approved: boolean }>;
}

/** The Context.get keys the siblings resolve under (the SCHEME documents
 *  these; the names follow the family's service-naming convention). */
export const SEAM_KEYS = {
	passOn: "batchPassOn",
	ingester: "batchIngester",
	approval: "approval",
} as const;
