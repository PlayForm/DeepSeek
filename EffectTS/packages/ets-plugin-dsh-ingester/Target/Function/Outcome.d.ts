/**
 * @module Outcome
 *
 * The feedback handoff: a batch outcome (applied / rejected) feeds the honest-feedback journal
 * and summary.
 *
 * @remarks
 * The plan defers this to the caller side, and the ingester IS the caller that
 * owns the outcome: it alone knows whether the write path applied, conflicted
 * or required recovery.
 *
 * The feedback service (`ctx.feedback`, plugin-dsh-feedback) is probed at
 * use time (the family's optional-service rule): absent = a silent skip, the
 * ingester's own journal still records the apply.
 */
import type Decision from "../Interface/Decision.js";
import type Proposal from "../Interface/Proposal.js";
import type Result from "../Interface/Result.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Proposal: Proposal, Decision: Decision, Result: Result): void;
