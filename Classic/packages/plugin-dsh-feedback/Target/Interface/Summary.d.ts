import type FeedbackBlock from "./Block.js";
import type Outcome from "./Outcome.js";
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
    /** The blocks themselves, for the deliberate review. */
    entries: FeedbackBlock[];
    /** The batch outcomes recorded for the session, oldest first. */
    outcomes: Outcome[];
}
