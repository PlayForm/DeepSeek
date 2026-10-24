// Batch - the contract conversion (Function/Batch): the pass-on's internal
// proposal (Interface/Proposal) becomes the CANONICAL batch proposal the
// board splices and the decision hook records. The conversion is the "real
// batch-contract wiring" the plan defers to the caller side:
//
//   - the intent OBJECT becomes the intent LABEL (the policy's allowlist key);
//   - the operations gain the contract's `kind` beside the literal
//     find/replace the apply path needs;
//   - the preview ARRAY becomes the contract's { entries, changes, skipped }
//     (the skipped list stays empty: a target with no operation was already
//     dropped at prepare time, never guessed here);
//   - `origin` carries the agent whose inbox will carry the proposal.
//
// Pure: the internal proposal is never mutated.
import type Batch from "../Interface/Batch.js";
import type Proposal from "../Interface/Proposal.js";

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
