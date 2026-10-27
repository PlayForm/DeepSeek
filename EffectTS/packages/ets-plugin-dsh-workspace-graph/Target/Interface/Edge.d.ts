import type { Span } from "@Interface/Node.js";
export type EdgeKind = "contains" | "imports" | "references";
export default interface Edge {
    kind: EdgeKind;
    from: string;
    to: string;
    span?: Span;
}
