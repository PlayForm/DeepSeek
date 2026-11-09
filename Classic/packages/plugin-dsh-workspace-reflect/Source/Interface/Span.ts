/**
 * @module Span
 *
 * The half-open [start, end) CHARACTER range the semantics service's rename
 * plan speaks.
 *
 * @remarks
 * The range is the service's own Span (`Interface/Span` in the semantics
 * package). The reflective operations address LINES; this is the bridge type
 * the plan's edits carry.
 */
export default interface Span {
	/**
	 * The offset of the first character (0-based).
	 */
	start: number;

	/**
	 * The offset one past the last character.
	 */
	end: number;
}
