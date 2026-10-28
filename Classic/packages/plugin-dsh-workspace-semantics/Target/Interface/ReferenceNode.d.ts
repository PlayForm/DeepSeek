import type Span from "./Span.js";
export default interface ReferenceNode {
    /** The referenced symbol's qualified name (may be unresolved). */
    target: string;
    /** The half-open character range of the use site. */
    span: Span;
}
