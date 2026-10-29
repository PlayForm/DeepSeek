import type { ReviewMessage } from "../Interface/Review.js";
/** The digest result: the text plus what it cost to build. */
export interface DigestResult {
    /** The digest text (never empty - an empty conversation yields a marker). */
    text: string;
    /** How many trailing messages were kept verbatim. */
    kept: number;
    /** How many leading messages collapsed into the summary. */
    collapsed: number;
    /** Whether the character cap dropped collapsed lines. */
    trimmed: boolean;
}
export default _default;
declare function _default(Messages: readonly ReviewMessage[], Tail: number, MaxChars: number): DigestResult;
