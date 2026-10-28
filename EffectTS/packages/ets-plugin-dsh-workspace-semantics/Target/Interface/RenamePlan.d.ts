import type Span from "./Span.js";
export default interface RenamePlan {
    /** The path the plan is for. */
    path: string;
    /** The qualified name being renamed. */
    from: string;
    /** The new name. */
    to: string;
    /** The half-open ranges to rewrite, one per use site. */
    edits: Span[];
    /** The adapter's declared certainty (the refusal-to-guess rule: an
     *  adapter that cannot be certain refuses instead of guessing). */
    certainty: "references" | "exact";
}
