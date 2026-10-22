// Edge - one graph edge (Interface/Edge in the brief's section 4.3 schema).
// Only the two W1 kinds exist: `contains` (File -> Symbol/Block/DocSection,
// and File -> Test for test-path files) and `imports` (File -> File for
// relative import specifiers). Every edge carries a source span.
import type { Span } from "@Interface/Node.js";

export type EdgeKind = "contains" | "imports";

export default interface Edge {
	kind: EdgeKind;
	from: string;
	to: string;
	span?: Span;
}
