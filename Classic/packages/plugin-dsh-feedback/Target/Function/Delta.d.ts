import type FeedbackBlock from "../Interface/Block.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Delta
 *
 * The parent's append (plan section 1: "the parent sessions append their
 * DELTAS - their own observations").
 *
 * @remarks
 *
 * The policy: the parents APPEND, never edit - the honest content survives the
 * chain. The delta is appended to the block's delta list and journaled.
 */
declare function _default(State: State, Session: string, AgentId: string, Text: string): FeedbackBlock | null;
