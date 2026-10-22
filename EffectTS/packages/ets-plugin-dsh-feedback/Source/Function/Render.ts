// Render - the block text (plan section 1). The format is fixed so the
// transfer stays mechanical: the parents parse the SAME format and append
// their deltas; the honest content is never rewritten.
import type FeedbackBlock from "../Interface/Block.js";

const Cap = (Value: string, Bytes: number): string =>
	Value.length <= Bytes ? Value : `${Value.slice(0, Bytes)}...`;

export default (Block: FeedbackBlock, MaxBlockBytes: number): string => {
	const Share = Math.max(64, Math.floor(MaxBlockBytes / 4));
	return [
		`[HONEST FEEDBACK - ${Block.agentId} - ${Block.task} - ${Block.session}]`,
		`LIKED: ${Cap(Block.liked, Share)}`,
		`DISLIKED: ${Cap(Block.disliked, Share)}`,
		`DELTAS: ${Block.deltas.length === 0 ? "-" : Block.deltas.join(" | ")}`,
		`TRANSFERRED: ${Block.transferred.length === 0 ? "-" : Block.transferred.join(" -> ")}`,
		`READ-STATUS: ${Block.readStatus}`,
	].join("\n");
};
