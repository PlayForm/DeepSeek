/**
 * @module Batch
 *
 * The batch contract's STRUCTURAL shapes (PASS-ON-AND-INGESTER.md section 2,
 * the shared artifact).
 *
 * @remarks
 *
 * Pure data and declarations - no behavior. The batch schema is owned by the
 * batch package (the batch-edit tool's schema where it fits); this hook only
 * CONSUMES it, so the shapes are kept minimal: only the fields the decision
 * gate reads or writes.
 *
 * The digest is the fence: the ingester applies only the proposal whose
 * digest and versions still match. The revision is the decision's fence.
 */
/**
 * One resolved target of a batch proposal.
 */
export interface BatchTarget {
    /**
     * The file path the edit touches, relative to the workspace root.
     */
    path: string;
    /**
     * The expected version of the target, for the digest fence.
     */
    version: string;
    /**
     * The byte/line span within the file, when the edit is partial.
     */
    span?: string | undefined;
    /**
     * Why this target is in the batch.
     */
    why: string;
}
/**
 * One declarative operation per target - described, never executed here. The
 * literal `find`/`replace` pair is what the apply path (the ingester)
 * executes; `kind`/`value` are the contract's declarative vocabulary.
 */
export interface BatchOperation {
    /**
     * The operation's declarative vocabulary (the apply path's verb).
     */
    kind: string;
    /**
     * The file path the operation addresses, relative to the workspace root.
     */
    path: string;
    /**
     * The operation's value, when the kind carries one.
     */
    value?: string | undefined;
    /**
     * The literal text to locate, for the `find`/`replace` pair.
     */
    find?: string | undefined;
    /**
     * The literal replacement text, for the `find`/`replace` pair.
     */
    replace?: string | undefined;
    /**
     * Why this operation is in the batch.
     */
    why?: string | undefined;
}
/**
 * The bounded before/after preview (the diff, not the full files).
 */
export interface BatchPreview {
    /**
     * One bounded before/after entry per changed file.
     */
    entries: {
        path: string;
        before: string;
        after: string;
    }[];
    /**
     * The number of applied changes the preview describes.
     */
    changes: number;
    /**
     * The targets skipped, each with its reason.
     */
    skipped: {
        path: string;
        why: string;
    }[];
}
/**
 * The proposal the pass-on hands to the decision.
 */
export interface BatchProposal {
    /**
     * Stable, content-derived.
     */
    id: string;
    /**
     * The intent label, e.g. "version-bump".
     */
    intent: string;
    /**
     * The resolved targets the batch proposes to edit.
     */
    targets: BatchTarget[];
    /**
     * The declarative operations, one per target.
     */
    operations: BatchOperation[];
    /**
     * The bounded before/after preview.
     */
    preview: BatchPreview;
    /**
     * sha256(targets + operations + versions) - the fence.
     */
    digest: string;
    /**
     * The batch's own revision.
     */
    revision: number;
    /**
     * Epoch ms after which the proposal expires.
     */
    expiresAt: number;
    /**
     * The intent's confidence, when the suggester supplied it.
     */
    confidence?: number | undefined;
    /**
     * The agent whose inbox carried the proposal - the decision's return
     * address (Function/Inbox delivers there first).
     */
    origin?: string | undefined;
}
/**
 * The decision the gate produces.
 */
export interface BatchDecision {
    /**
     * The proposal id the decision concerns.
     */
    proposal: string;
    /**
     * The decision's outcome.
     */
    outcome: "approved" | "denied" | "expired";
    /**
     * Who produced the decision.
     */
    by: "user" | "policy";
    /**
     * Epoch ms of the decision.
     */
    at: number;
}
/**
 * The result the ingester reports back.
 */
export interface BatchResult {
    /**
     * The proposal id the apply concerned.
     */
    proposal: string;
    /**
     * One per-target outcome record.
     */
    perTarget: {
        /**
         * The file path the target addressed.
         */
        path: string;
        /**
         * The target's apply outcome.
         */
        outcome: "applied" | "conflict" | "skipped" | "recovery-required";
        /**
         * The version the target ended at.
         */
        version: string;
    }[];
    /**
     * The number of targets applied.
     */
    applied: number;
    /**
     * The number of targets that hit a conflict.
     */
    conflicts: number;
    /**
     * The number of targets that need recovery.
     */
    recovery: number;
}
/**
 * The hook's own event vocabulary on the cordis bus (the factory's
 * loader/volatile-update precedent): the proposal the pass-on emits and the
 * decision the hook emits for the ingester and the live view. The
 * declaration lives here because these names are this hook's contract.
 */
declare module "@deepseek-ai/cordis" {
    interface Events {
        /**
         * One batch proposal handed over for a decision (emit mode).
         */
        "batch/proposed"(Proposal: BatchProposal): void;
        /**
         * One recorded decision (user or policy); the ingester listens.
         */
        "batch/decision"(Decision: BatchDecision): void;
    }
}
