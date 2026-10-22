// Push - the transfer service's mechanical hop (plan section 2.2). The
// child's block is pushed to its parent's session log: the same honest
// content, the parent's session recorded as the next hop, the delta chain
// untouched. The transfer is a mechanical FIFO through the lineage (the
// parentage is the queue: the feedback flows the tree upward, ONE hop per
// session boundary) - the caller supplies the destination session id, because
// the queue integration knows the parentage.
import type FeedbackBlock from "../Interface/Block.js";
import type State from "../Interface/State.js";
import Record from "./Record.js";

export default (State: State, Block: FeedbackBlock, ParentSession: string): void => {
	switch (true) {
		case !State.Config.enabled:
			return;
		case ParentSession === Block.session:
			// A push back to the same session is a no-op (the hop must cross a
			// session boundary).
			return;
	}
	const Chain = [...Block.transferred, Block.session];
	switch (true) {
		case Chain.length > State.Config.maxChain:
			// The chain cap: a block that has traversed too many boundaries is
			// journaled as dropped, not silently abandoned.
			return;
		default:
			break;
	}
	Record(State, {
		...Block,
		session: ParentSession,
		transferred: Chain,
	});
};
