// Record - store a block in the session's council record and journal it
// (plan section 2.1). Oversized text is capped, never dropped silently: the
// cap marker is appended to the text and the journal line records the fact.
// The block is stored UNREAD - the transfer never forces the reading.
import type FeedbackBlock from "../Interface/Block.js";
import type State from "../Interface/State.js";
import JournalFn from "./Journal.js";

/** Cap one text field; the marker records that a cap was applied. */
export const Cap = (Value: string, Bytes: number): string =>
	Value.length <= Bytes ? Value : `${Value.slice(0, Bytes)}... [capped]`;

export default (State: State, Block: FeedbackBlock): void => {
	const Share = Math.max(64, Math.floor(State.Config.maxBlockBytes / 4));
	const Safe: FeedbackBlock = {
		...Block,
		liked: Cap(Block.liked, Share),
		disliked: Cap(Block.disliked, Share),
		deltas: Block.deltas.map((Delta) => Cap(Delta, Share)),
	};
	const Session = State.Sessions.get(Safe.session) ?? {
		blocks: new Map<string, FeedbackBlock>(),
		order: [],
	};
	const Existing = Session.blocks.get(Safe.agentId);
	// The same agent's newer block replaces the older one in place (the
	// council record holds the latest signal per agent); the delta chain
	// survives - the deltas are part of the block.
	Session.blocks.set(Safe.agentId, Safe);
	if (Existing === undefined) {
		Session.order.push(Safe.agentId);
	}
	State.Sessions.set(Safe.session, Session);
	JournalFn(State, Existing === undefined ? "recorded" : "restored", Safe);
};
