// Handoff - the sibling-service resolution and the ingester call
// (Function/Handoff). The services are resolved via Context.get at use time
// (the tool-jobs precedent) - never injected, never imported from sibling
// workspace packages (the self-contained PoC posture; the end-phase wires
// the real services). An absent sibling is a silent skip plus one ledger
// line; a present sibling's failure is caught and logged, never thrown into
// the caller.
import type { Context } from "@deepseek-ai/cordis";
import type { BatchDecision, BatchResult } from "@Interface/Batch.js";
import {
	SEAM_KEYS,
	type ApprovalService,
	type IngesterService,
	type PassOnService,
} from "@Interface/Siblings.js";

export const Resolve = (Context_: Context, Key: string): unknown => {
	try {
		return Context_.get?.(Key);
	} catch {
		return undefined;
	}
};

export const PassOn = (Context_: Context): PassOnService | undefined =>
	Resolve(Context_, SEAM_KEYS.passOn) as PassOnService | undefined;

export const Ingester = (Context_: Context): IngesterService | undefined =>
	Resolve(Context_, SEAM_KEYS.ingester) as IngesterService | undefined;

export const Approval = (Context_: Context): ApprovalService | undefined =>
	Resolve(Context_, SEAM_KEYS.approval) as ApprovalService | undefined;

/** Hand the decision to the ingester; null when no ingester is present or
 *  the handoff fails (logged by the caller). */
export const ToIngester = async (
	Context_: Context,
	Decision: BatchDecision,
): Promise<BatchResult | null> => {
	const Service = Ingester(Context_);
	if (Service === undefined) {
		return null;
	}
	try {
		return await Service.apply(Decision);
	} catch {
		return null;
	}
};
