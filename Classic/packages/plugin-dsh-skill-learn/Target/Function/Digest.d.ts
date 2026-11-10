import type Message from "../Interface/Message.js";
/**
 * @module Digest
 *
 * The bounded transcript digest the review model receives, ported rule for rule from
 * Hermes' `_digest_history` (`agent/background_review.py:332-362`) as plan section
 * 4.4 states it.
 *
 * @remarks
 *
 * WHY A DIGEST AT ALL: the review runs on a ROUTED model, whose prompt cache is cold
 * for this conversation anyway, so a compact replay costs a fraction of a full one and
 * loses nothing the reviewer needs (plan section 4.1). The Hermes function returns
 * messages; this package's digest is a STRING because the whole request is one user
 * message carrying "the digest text, then the skill index, then the phase marker"
 * (plan section 4.1). The one adaptation that follows from it: Hermes prepends a
 * synthetic user message to the kept tail messages, while here the collapsed lines and
 * the kept tail are rendered into one text, in that order, so the tail still follows
 * the summary exactly as the header promises.
 *
 * THE TWO RULES THAT MAKE A DIGEST SAFE:
 *
 * - THE TAIL IS VERBATIM AND NEVER STARTS ON A TOOL RESULT. A digest that cuts between
 *   a tool call and its result hands the reviewer an unanswered call, and the first
 *   thing it does is reason about a result it cannot see. The tail therefore grows
 *   until it starts on a non-`tool` message (`agent/background_review.py:337-341`).
 * - THE COLLAPSE KEEPS BOTH SIDES. A digest of assistant turns only hides exactly the
 *   corrections the review exists to catch; a digest of user turns only hides the
 *   workflow that was corrected. So a user message contributes `USER: `, an assistant
 *   message contributes its tool names and its text, and everything else contributes
 *   nothing to the SUMMARY (`agent/background_review.py:345-356`).
 *
 * THE TWO PER-LINE CAPS BOUND THE SUMMARY, NOT THE TAIL. That is the Hermes split: the
 * caps exist because the summary is invented text, while the tail is the reviewer's
 * evidence and is kept whole (plan section 4.4, "kept verbatim"). There is no total
 * cap, by the same row: the tail bound and the two per-line caps are the whole budget.
 */
/**
 * The three caps the digest reads from the resolved knobs.
 */
export interface DigestLimits {
    /**
     * Messages kept verbatim; older ones collapse into the summary lines.
     */
    readonly digestTail: number;
    /**
     * The cap on one `USER: ` summary line.
     */
    readonly digestUserChars: number;
    /**
     * The cap on one `ASSISTANT: ` summary line.
     */
    readonly digestAssistantChars: number;
}
/**
 * The digest text plus the two counts the report prints to prove its shape.
 */
export interface DigestResult {
    /**
     * The digest text; empty only for an empty transcript.
     */
    readonly text: string;
    /**
     * How many trailing messages were kept verbatim.
     */
    readonly kept: number;
    /**
     * How many leading messages collapsed into the summary.
     */
    readonly collapsed: number;
}
export default _default;
declare function _default(Messages: readonly Message[], Limits: DigestLimits): DigestResult;
