/**
 * @module Digest
 *
 * The bounded conversation digest the review model receives.
 *
 * @remarks
 * THE SHAPE COMES FROM HERMES' `_digest_history`, and so does the reason for
 * it: when the review runs on the SAME model as the live turn it replays the
 * transcript as warm cache reads, but a routed (cheaper) model has a cold
 * cache anyway, so a compact digest is strictly better than a full replay -
 * the same lesson lands for a fraction of the tokens.
 *
 * THE TWO RULES that make a digest safe:
 *
 * 1. THE TAIL IS VERBATIM AND NEVER STARTS ON A TOOL RESULT. A digest that
 *    cuts between a tool call and its result hands the reviewer an
 *    unanswered call, and the first thing it does is reason about a result
 *    it cannot see. The tail therefore grows until it starts on a
 *    non-`tool` message.
 * 2. THE COLLAPSE KEEPS BOTH SIDES. A digest of assistant turns only hides
 *    exactly the corrections the review exists to catch; a digest of user
 *    turns only hides the workflow that was corrected.
 *
 * The character cap is applied LAST, from the FRONT: the recent turns are
 * what the reviewer needs, so the oldest collapsed lines are what get
 * dropped.
 */
import type { ReviewMessage } from "@Interface/Review.js";
/**
 * The digest result: the text plus what it cost to build.
 */
export interface DigestResult {
    /**
     * The digest text (never empty - an empty conversation yields a marker).
     */
    text: string;
    /**
     * How many trailing messages were kept verbatim.
     */
    kept: number;
    /**
     * How many leading messages collapsed into the summary.
     */
    collapsed: number;
    /**
     * Whether the character cap dropped collapsed lines.
     */
    trimmed: boolean;
}
export default _default;
declare function _default(Messages: readonly ReviewMessage[], Tail: number, MaxChars: number): DigestResult;
