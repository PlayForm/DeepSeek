import type { BatchDecision, BatchProposal } from "./Batch.js";
import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";
/** One proposal pending a decision, plus its recorded decision when made. */
export interface PendingProposal {
    proposal: BatchProposal;
    proposedAt: number;
    decided?: BatchDecision | undefined;
}
export default interface State extends Shared {
    /** Master switch (config `enabled`, volatile) - false = full passthrough. */
    On: boolean;
    /** The auto-approve policy mode (config `autoApprove`, volatile). */
    AutoApprove: "off" | "on";
    /** The intent classes eligible for auto-approval (config `allowlist`). */
    Allowlist: string[];
    /** Maximum target count the policy may auto-approve. */
    MaxAutoTargets: number;
    /** Minimum intent confidence the policy may auto-approve. */
    MinConfidence: number;
    /** How long a pending proposal is kept before it drops from the map. */
    PendingTtlMs: number;
    /** The injected factory service itself (the ledger) - set once in Apply. */
    Factory: Factory;
    /** The pending proposals by id (bounded by PendingTtlMs). */
    Pending: Map<string, PendingProposal>;
    /** How many proposals of each intent class this hook has seen - the
     *  first-batch rule's counter: intent class n=1 always requires the user. */
    SeenIntents: Map<string, number>;
    /** The clock seam: an optional override of the time source. */
    Now?: (() => number) | undefined;
}
