// Siblings - the STRUCTURAL shapes of the services this hook calls but does
// NOT own (PASS-ON-AND-INGESTER.md section 5: "it does not implement the
// pass-on or the ingester; it calls them"). Self-contained PoC posture: the
// shapes are declared here and resolved via Context.get at use time (the
// tool-jobs precedent - never injected, never imported from sibling
// workspace packages). An absent sibling is a silent skip plus one ledger
// line, never an error thrown into a caller.
//
// THE SEAM KEYS ARE TWO NAMES: the declared seam (`batchPassOn`,
// `batchIngester` - what a host or a fixture registers) and the LIVE service
// name the sibling package actually registers (`passOn`, `ingester` -
// `super(Context, "passOn")` / `super(Context, "ingester")`). The resolver
// asks the declared seam first, then the live name, so the hook works
// against both without importing the packages.

/** The pass-on service (plugin-dsh-pass-on): proposal preparation. The hook
 *  does not call it on any of its own paths (the pass-on publishes the
 *  proposal itself) - the seam is declared so a host wiring can resolve it. */
export interface PassOnService {
	prepare(input: unknown): Promise<unknown | null>;
	/** The live service's read (the internal proposal). */
	Get?(id: string): unknown;
}

/** The ingester service (plugin-dsh-ingester): the only writer. `Apply` is
 *  the live service's method (the proposal + the decision); `apply` is the
 *  declared one-argument seam a host may implement (the service resolves its
 *  own proposal). Either one satisfies the handoff. */
export interface IngesterService {
	apply?(
		decision: import("./Batch.js").BatchDecision,
	): Promise<import("./Batch.js").BatchResult | null>;
	Apply?(
		proposal: import("./Batch.js").BatchProposal,
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

/** The LIVE service names the sibling packages register. */
export const LIVE_KEYS = {
	passOn: "passOn",
	ingester: "ingester",
} as const;
