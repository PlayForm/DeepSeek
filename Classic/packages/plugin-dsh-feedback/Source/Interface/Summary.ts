// Summary - the council view: one session's aggregate signals (plan section
// 2.2, `feedback/summary`). It exists for the recipient's deliberate review;
// nothing here force-reads a block (the read-status is only touched by
// Function/Read).
import type FeedbackBlock from "./Block.js";

export default interface Summary {
	session: string;
	/** Number of blocks recorded for the session. */
	blocks: number;
	/** Number of blocks still unread. */
	unread: number;
	/** The most frequent terms in the LIKED texts. */
	liked: string[];
	/** The most frequent terms in the DISLIKED texts. */
	disliked: string[];
	/** The most recent deltas, newest first (the LIFO-ish lineage chain). */
	/** The blocks themselves, for the deliberate review. */
	entries: FeedbackBlock[];
}
