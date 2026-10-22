import type { Span } from "@Interface/Node.js";
export type EdgeKind = "contains" | "imports";
export default interface Edge {
    kind: EdgeKind;
    from: string;
    to: string;
    span?: Span;
}
