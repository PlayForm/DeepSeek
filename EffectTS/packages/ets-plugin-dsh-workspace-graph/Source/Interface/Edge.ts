// Edge - one graph edge (Interface/Edge in the brief's section 4.3 schema).
// The W1 kinds plus the REFERENCES kind this wave wires: `contains`
// (File -> Symbol/Block/DocSection, and File -> Test for test-path files),
// `imports` (File -> File for relative import specifiers) and `references`
// (the node that USES a symbol -> the Symbol node it uses; emitted only when
// the semantics service is present and the target resolves to a node of the
// same file - never a dangling edge). The `calls`, `tests` and `ConfigKey`
// kinds stay deferred and are not faked. Every edge carries a source span.
import type { Span } from "@Interface/Node.js";

export type EdgeKind = "contains" | "imports" | "references";

export default interface Edge {
	kind: EdgeKind;
	from: string;
	to: string;
	span?: Span;
}
