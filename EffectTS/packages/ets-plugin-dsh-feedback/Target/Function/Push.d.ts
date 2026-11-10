/**
 * @module Push
 *
 * The transfer service's mechanical hop: the child's block is pushed to its parent's session log.
 *
 * @remarks
 * Plan section 2.2. The push carries the same honest content, the parent's session recorded as
 * the next hop, the delta chain untouched. The transfer is a mechanical FIFO through the lineage
 * (the parentage is the queue: the feedback flows the tree upward, ONE hop per session boundary)
 * - the caller supplies the destination session id, because the queue integration knows the
 * parentage.
 */
import type FeedbackBlock from "../Interface/Block.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Block: FeedbackBlock, ParentSession: string): void;
