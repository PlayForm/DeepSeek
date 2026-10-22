// Delta - the parent's append (plan section 1: "the parent sessions append
// their DELTAS - their own observations"). The policy: the parents APPEND,
// never edit - the honest content survives the chain. The delta is appended
// to the block's delta list and journaled.
import type FeedbackBlock from "../Interface/Block.js";
import type State from "../Interface/State.js";
import JournalFn from "./Journal.js";

export default (
	State: State,
	Session: string,
	AgentId: string,
	Text: string,
): FeedbackBlock | null => {
	const Found = State.Sessions.get(Session);
	const Block = Found?.blocks.get(AgentId);
	switch (true) {
		case Block === undefined:
			return null;
		default:
			break;
	}
	const Updated: FeedbackBlock = {
		...Block,
		deltas: [...Block.deltas, Text],
	};
	Found?.blocks.set(AgentId, Updated);
	JournalFn(State, "delta", Updated);
	return Updated;
};
