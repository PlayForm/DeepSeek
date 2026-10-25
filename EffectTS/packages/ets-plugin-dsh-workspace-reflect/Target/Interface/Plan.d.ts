import type Span from "@Interface/Span.js";
export default interface Plan {
    /** The identifier the plan renames. */
    from: string;
    /** The new name. */
    to: string;
    /** The half-open character ranges to rewrite. */
    edits: Span[];
}
