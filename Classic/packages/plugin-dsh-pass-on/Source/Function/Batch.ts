import type Batch from "../Interface/Batch.js";
import type Proposal from "../Interface/Proposal.js";

/**
 * @module Batch
 *
 * The contract conversion: the pass-on's internal proposal
 * (`Interface/Proposal`) becomes the canonical batch proposal the board splices
 * and the decision hook records.
 *
 * @remarks
 *
 * The conversion is the "real batch-contract wiring" the plan defers to the
 * caller side:
 *
 * - The intent object becomes the intent label (the policy's allowlist key).
 * - The operations gain the contract's `kind` beside the literal find/replace
 *   the apply path needs.
 * - The preview array becomes the contract's { entries, changes, skipped } (the
 *   skipped list stays empty: a target with no operation was already dropped at
 *   prepare time, never guessed here).
 * - `origin` carries the agent whose inbox will carry the proposal.
 *
 * Pure: the internal proposal is never mutated.
 */
export default (Proposal: Proposal, Origin: string): Batch => ({
	id: Proposal.id,
	intent: Proposal.intent.kind,
	targets: Proposal.targets.map((One) => ({
		path: One.path,
		version: One.version,
		why: One.why,
	})),
	operations: Proposal.operations.map((One) => ({
		kind: "replace",
		path: One.path,
		find: One.find,
		replace: One.replace,
		why: One.why,
	})),
	preview: {
		entries: Proposal.preview.map((One) => ({
			path: One.path,
			before: One.before,
			after: One.after,
		})),
		changes: Proposal.targets.length,
		skipped: [],
	},
	digest: Proposal.digest,
	revision: Proposal.revision,
	expiresAt: Proposal.expiresAt,
	origin: Origin.length > 0 ? Origin : undefined,
});
