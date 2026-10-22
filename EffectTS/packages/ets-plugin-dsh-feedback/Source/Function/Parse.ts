// Parse - the reverse of Render: extract a FeedbackBlock from transferred
// text (an inbox splice body). A parse miss is a silent no-op - only a
// matching block is recorded; nothing is ever invented from partial text.
import type FeedbackBlock from "../Interface/Block.js";

/** Parse the FIRST honest-feedback block in the text, or null. */
export default (Text: string): FeedbackBlock | null => {
	const Match =
		/\[HONEST FEEDBACK - (.+?) - (.+?) - (.+?)\]\nLIKED: ([\s\S]*?)\nDISLIKED: ([\s\S]*?)\nDELTAS: (.*?)\nTRANSFERRED: (.*?)(?:\nREAD-STATUS: (.*?))?(?:\n|$)/.exec(
			Text,
		);
	switch (true) {
		case Match === null:
			return null;
		default: {
			const [, agentId, task, session, liked, disliked, deltas, transferred, readStatus] =
				Match as unknown as string[];
			return {
				agentId: agentId ?? "",
				task: task ?? "",
				session: session ?? "",
				liked: liked ?? "",
				disliked: disliked ?? "",
				deltas:
					deltas === undefined || deltas === "-" || deltas.trim() === ""
						? []
						: deltas.split(" | "),
				transferred:
					transferred === undefined || transferred === "-" || transferred.trim() === ""
						? []
						: transferred.split(" -> "),
				// The incoming block keeps the transfer chain it carried; the
				// receiver's own hop is appended by Function/Push, not here.
				readStatus: readStatus ?? "unread",
				at: Date.now(),
			};
		}
	}
};
