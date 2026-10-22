/** The pass-on service (plugin-dsh-pass-on): proposal preparation. */
export interface PassOnService {
    prepare(input: unknown): Promise<import("./Batch.js").BatchProposal | null>;
}
/** The ingester service (plugin-dsh-ingester): the only writer. */
export interface IngesterService {
    apply(decision: import("./Batch.js").BatchDecision): Promise<import("./Batch.js").BatchResult | null>;
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
