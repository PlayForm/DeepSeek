import type Decision from "../Interface/Decision.js";
import type Proposal from "../Interface/Proposal.js";
import type Result from "../Interface/Result.js";
import type State from "../Interface/State.js";
/**
 * @module Claim
 *
 * The one-apply-per-DECISION gate (Function/Claim): the claim is taken
 * SYNCHRONOUSLY, before any await, so the same decision arriving twice (the
 * tool's direct handoff and the `batch/decision` event, or the same event
 * delivered by two channels) applies EXACTLY once and every caller receives
 * the same honest result.
 *
 * @remarks
 *
 * The claim key is the decision's identity - the proposal, the outcome and the
 * decision's own timestamp - so a REPEATED delivery collapses while a genuinely
 * NEW decision on the same proposal (the user denying after an approval, a
 * re-decision after an edit) still runs and reports honestly.
 *
 * The map holds the claimed promise: the first caller starts the apply, the
 * later callers await the same promise. `WhenIdle` drains it for the smokes (no
 * sleeps, no timers).
 */
/**
 * The decision's identity: one apply per (proposal, outcome, at).
 */
export declare const Key: (Decision: Decision) => string;
export default _default;
declare function _default(State: State, Proposal: Proposal, Decision: Decision): Promise<Result | null>;
