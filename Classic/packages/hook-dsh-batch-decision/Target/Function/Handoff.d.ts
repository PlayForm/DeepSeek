import type { Context } from "@deepseek-ai/cordis";
import type { BatchDecision, BatchProposal, BatchResult } from "@Interface/Batch.js";
import { type ApprovalService, type IngesterService, type PassOnService } from "@Interface/Siblings.js";
export declare const Resolve: (Context_: Context, Key: string) => unknown;
export declare const PassOn: (Context_: Context) => PassOnService | undefined;
export declare const Ingester: (Context_: Context) => IngesterService | undefined;
export declare const Approval: (Context_: Context) => ApprovalService | undefined;
/** Hand the decision to the ingester; null when no ingester is present or
 *  the handoff fails (logged by the caller). The live ingester takes the
 *  proposal and the decision (`Apply`); a seam-only service takes the
 *  decision alone (`apply`). */
export declare const ToIngester: (Context_: Context, Decision: BatchDecision, Proposal?: BatchProposal) => Promise<BatchResult | null>;
