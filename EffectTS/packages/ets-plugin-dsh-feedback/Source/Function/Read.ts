// Read - the recipient's OPTIONAL read (plan section 2.2). The block is
// NEVER force-read; the read-status is recorded when the recipient opens it.
// The record's block is updated in place (readStatus) and the event is
// journaled.
import type FeedbackBlock from "../Interface/Block.js";
import type State from "../Interface/State.js";
import Record from "./Record.js";

export default (
	State: State,
	Session: string,
	AgentId: string,
	Reader: string,
): FeedbackBlock | null => {
	const Found = State.Sessions.get(Session);
	const Block = Found?.blocks.get(AgentId);
	if (Block === undefined) {
		return null;
	}
	if (Block.readStatus !== "unread") {
		// Already read - idempotent, no second journal line.
		return Block;
	}
	const Read: FeedbackBlock = {
		...Block,
		readStatus: `read-at ${Reader}`,
	};
	Record(State, Read);
	return Read;
};
