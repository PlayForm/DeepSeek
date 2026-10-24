export default interface Span {
    /** The offset of the first character (0-based). */
    start: number;
    /** The offset one past the last character. */
    end: number;
}
