/**
 * @module Handoff
 *
 * The sibling-service resolution and the ingester call.
 *
 * @remarks
 * The services are resolved via Context.get at use time (the tool-jobs
 * precedent) - never injected, never imported from sibling workspace
 * packages (the self-contained posture). An absent sibling is a silent skip
 * plus one ledger line; a present sibling's failure is caught and logged,
 * never thrown into the caller.
 *
 * THE TWO NAMES: the declared seam (`batchPassOn` / `batchIngester`) and the
 * LIVE service name the sibling registers (`passOn` / `ingester`) are both
 * probed, seam first - so the hook works against a host's seam AND against
 * the real packages without importing them (Interface/Siblings documents the
 * pair).
 */
import type { Context } from "@deepseek-ai/cordis";
import type { BatchDecision, BatchProposal, BatchResult } from "../Interface/Batch.js";
import { type ApprovalService, type IngesterService, type PassOnService } from "../Interface/Siblings.js";
export declare const Resolve: (Context_: Context, Key: string) => unknown;
export declare const PassOn: (Context_: Context) => PassOnService | undefined;
export declare const Ingester: (Context_: Context) => IngesterService | undefined;
export declare const Approval: (Context_: Context) => ApprovalService | undefined;
/**
 * Hand the decision to the ingester; null when no ingester is present or the
 * handoff fails (logged by the caller). The live ingester takes the proposal
 * and the decision (`Apply`); a seam-only service takes the decision alone
 * (`apply`).
 */
export declare const ToIngester: (Context_: Context, Decision: BatchDecision, Proposal?: BatchProposal) => Promise<BatchResult | null>;
