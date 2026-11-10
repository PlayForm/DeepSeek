import type Span from "@Interface/Span.js";

/**
 * @module ReferenceNode
 *
 * One reference of the semantic model: who uses X, from where.
 *
 * @remarks
 *
 * The graph schema v0's references edge, collapsed per file.
 */
export default interface ReferenceNode {
	/**
	 * The referenced symbol's qualified name (may be unresolved).
	 */
	target: string;

	/**
	 * The half-open character range of the use site.
	 */
	span: Span;
}
