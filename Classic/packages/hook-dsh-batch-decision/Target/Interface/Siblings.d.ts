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
    apply?(decision: import("./Batch.js").BatchDecision): Promise<import("./Batch.js").BatchResult | null>;
    Apply?(proposal: import("./Batch.js").BatchProposal, decision: import("./Batch.js").BatchDecision): Promise<import("./Batch.js").BatchResult | null>;
}
/** The approval service (ctx.approval): the policy surface for the
 *  require-user path, when a host provides one. */
export interface ApprovalService {
    request(payload: unknown): Promise<{
        approved: boolean;
    }>;
}
/** The Context.get keys the siblings resolve under (the SCHEME documents
 *  these; the names follow the family's service-naming convention). */
export declare const SEAM_KEYS: {
    readonly passOn: "batchPassOn";
    readonly ingester: "batchIngester";
    readonly approval: "approval";
};
/** The LIVE service names the sibling packages register. */
export declare const LIVE_KEYS: {
    readonly passOn: "passOn";
    readonly ingester: "ingester";
};
