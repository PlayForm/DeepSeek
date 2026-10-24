export interface Target {
    /** Absolute path of the target file. */
    path: string;
    /** The content snapshot token the ingester fences against. */
    version: string;
    /** Why the target is in the batch. */
    why: string;
}
export interface Operation {
    /** The operation kind (the batch contract's vocabulary). */
    kind: string;
    /** Absolute path of the target file. */
    path: string;
    /** The replacement value, when the kind carries one. */
    value?: string | undefined;
    /** The literal text the apply replaces. */
    find?: string | undefined;
    /** The literal replacement the apply writes. */
    replace?: string | undefined;
    /** Why the operation exists. */
    why?: string | undefined;
}
export interface Preview {
    /** The bounded before/after per target. */
    entries: {
        path: string;
        before: string;
        after: string;
    }[];
    /** The number of changes the batch carries. */
    changes: number;
    /** The targets the prepare skipped, with the reason. */
    skipped: {
        path: string;
        why: string;
    }[];
}
export default interface Proposal {
    /** Stable, content-derived id. */
    id: string;
    /** The intent label (the decision policy's allowlist key). */
    intent: string;
    /** The resolved targets. */
    targets: Target[];
    /** The declarative operations, never executed by the board. */
    operations: Operation[];
    /** The bounded preview. */
    preview: Preview;
    /** sha256(targets + operations + versions) - the apply fence. */
    digest: string;
    /** The batch's own revision (the splice fence). */
    revision: number;
    /** Epoch ms after which the proposal expires. */
    expiresAt: number;
    /** The intent's confidence, when the producer supplied it. */
    confidence?: number | undefined;
    /** The agent whose inbox carried the proposal (the decision's return
     *  address); absent when the producer could not resolve one. */
    origin?: string | undefined;
}
