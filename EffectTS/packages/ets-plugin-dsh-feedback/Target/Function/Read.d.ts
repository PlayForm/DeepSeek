import type FeedbackBlock from "../Interface/Block.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Read
 *
 * The recipient's OPTIONAL read.
 *
 * @remarks
 *
 * Plan section 2.2. The block is NEVER force-read; the read-status is recorded when the recipient
 * opens it. The record's block is updated in place (readStatus) and the event is journaled.
 */
declare function _default(State: State, Session: string, AgentId: string, Reader: string): FeedbackBlock | null;
