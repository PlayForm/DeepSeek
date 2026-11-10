import type { Span } from "./Node.js";
/**
 * @module Edge
 *
 * One graph edge, per the brief's section 4.3 schema.
 *
 * @remarks
 *
 * The W1 kinds plus the REFERENCES kind this wave wires: `contains` (File ->
 * Symbol/Block/DocSection, and File -> Test for test-path files), `imports`
 * (File -> File for relative import specifiers) and `references` (the node
 * that USES a symbol -> the Symbol node it uses; emitted only when the
 * semantics service is present and the target resolves to a node of the same
 * file - never a dangling edge). The `calls`, `tests` and `ConfigKey` kinds
 * stay deferred and are not faked. Every edge carries a source span.
 */
/**
 * The edge kinds the W1 graph emits.
 */
export type EdgeKind = "contains" | "imports" | "references";
export default interface Edge {
    /**
     * The edge kind.
     */
    kind: EdgeKind;
    /**
     * The source node id.
     */
    from: string;
    /**
     * The target node id.
     */
    to: string;
    /**
     * The source span in the file the edge was derived from.
     */
    span?: Span;
}
