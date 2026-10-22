// Span - the half-open [start, end) character range of a symbol or a block
// inside its file's text (the graph schema v0's span field, V4-1 section 3.1).
export default interface Span {
	/** The offset of the first character (0-based). */
	start: number;
	/** The offset one past the last character. */
	end: number;
}
