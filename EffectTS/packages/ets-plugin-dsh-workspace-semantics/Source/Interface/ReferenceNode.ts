// ReferenceNode - one reference of the semantic model (the graph schema v0's
// references edge, collapsed per file): who uses X, from where.
import type Span from "@Interface/Span.js";

export default interface ReferenceNode {
	/** The referenced symbol's qualified name (may be unresolved). */
	target: string;
	/** The half-open character range of the use site. */
	span: Span;
}
