import type FeedbackBlock from "../Interface/Block.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Delta
 *
 * The parent's append: the delta is appended to the block's delta list and journaled.
 *
 * @remarks
 *
 * Plan section 1: "the parent sessions append their DELTAS - their own observations". The policy:
 * the parents APPEND, never edit - the honest content survives the chain.
 */
declare function _default(State: State, Session: string, AgentId: string, Text: string): FeedbackBlock | null;
