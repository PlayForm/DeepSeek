import type Intent from "../Interface/Intent.js";
import type Proposal from "../Interface/Proposal.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Prepare
 *
 * The pass-on's orchestration (plan section 3): resolve the targets,
 * synthesize the operations, render the preview, compute the digest.
 *
 * @remarks
 *
 * READ-ONLY: nothing is written. If the proposal is empty or ambiguous
 * (unknown kind, no effective operations), the pass-on returns no batch - not
 * an empty one.
 */
declare function _default(State: State, Intent: Intent): Proposal | null;
