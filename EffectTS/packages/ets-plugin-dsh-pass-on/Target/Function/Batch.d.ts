import type Batch from "../Interface/Batch.js";
import type Proposal from "../Interface/Proposal.js";
export default _default;
/**
 * @module Batch
 *
 * The contract conversion: the pass-on's internal proposal becomes the
 * CANONICAL batch proposal the board splices and the decision hook records.
 *
 * @remarks
 *
 * The conversion is the "real batch-contract wiring" the plan defers to the
 * caller side:
 * - the intent OBJECT becomes the intent LABEL (the policy's allowlist key);
 * - the operations gain the contract's `kind` beside the literal find/replace
 *   the apply path needs;
 * - the preview ARRAY becomes the contract's { entries, changes, skipped }
 *   (the skipped list stays empty: a target with no operation was already
 *   dropped at prepare time, never guessed here);
 * - `origin` carries the agent whose inbox will carry the proposal.
 *
 * Pure: the internal proposal is never mutated.
 */
declare function _default(Proposal: Proposal, Origin: string): Batch;
