// Handoff - the sibling-service resolution and the ingester call
// (Function/Handoff). The services are resolved via Context.get at use time
// (the tool-jobs precedent) - never injected, never imported from sibling
// workspace packages (the self-contained posture). An absent sibling is a
// silent skip plus one ledger line; a present sibling's failure is caught and
// logged, never thrown into the caller.
//
// THE TWO NAMES: the declared seam (`batchPassOn` / `batchIngester`) and the
// LIVE service name the sibling registers (`passOn` / `ingester`) are both
// probed, seam first - so the hook works against a host's seam AND against
// the real packages without importing them (Interface/Siblings documents the
// pair).
import type { Context } from "@deepseek-ai/cordis";
import type { BatchDecision, BatchProposal, BatchResult } from "@Interface/Batch.js";
import {
	LIVE_KEYS,
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
	(Resolve(Context_, SEAM_KEYS.passOn) ?? Resolve(Context_, LIVE_KEYS.passOn)) as
		PassOnService | undefined;

export const Ingester = (Context_: Context): IngesterService | undefined =>
	(Resolve(Context_, SEAM_KEYS.ingester) ?? Resolve(Context_, LIVE_KEYS.ingester)) as
		IngesterService | undefined;

export const Approval = (Context_: Context): ApprovalService | undefined =>
	Resolve(Context_, SEAM_KEYS.approval) as ApprovalService | undefined;

/** Hand the decision to the ingester; null when no ingester is present or
 *  the handoff fails (logged by the caller). The live ingester takes the
 *  proposal and the decision (`Apply`); a seam-only service takes the
 *  decision alone (`apply`). */
export const ToIngester = async (
	Context_: Context,
	Decision: BatchDecision,
	Proposal?: BatchProposal,
): Promise<BatchResult | null> => {
	const Service = Ingester(Context_);
	switch (true) {
		case Service === undefined:
			return null;
		default:
			break;
	}
	try {
		switch (true) {
			case typeof Service.Apply === "function" && Proposal !== undefined:
				return await Service.Apply(Proposal, Decision);
			case typeof Service.apply === "function":
				return await Service.apply(Decision);
			default:
				return null;
		}
	} catch {
		return null;
	}
};
