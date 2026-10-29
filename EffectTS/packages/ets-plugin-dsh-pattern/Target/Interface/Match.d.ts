export default interface Match {
    /** The live context the match runs against (all fields optional). */
    context: {
        /** The tool name being called or serviced, when known. */
        tool?: string | undefined;
        /** The free text to keyword-match (the request, the query, the intent). */
        text?: string | undefined;
    };
}
/** One ranked match. `score` is 0..1; the result list is sorted by it. */
export interface MatchResult {
    pattern: import("./Pattern.js").default;
    score: number;
}
