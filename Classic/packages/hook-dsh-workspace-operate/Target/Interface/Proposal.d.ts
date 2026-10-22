export default interface Proposal {
    /** The stable id: `<kind>-<sequence>` (unique per hook instance). */
    id: string;
    /** The proposal kind. */
    kind: "rename" | "connect" | "replace";
    /** The lifecycle status (the operate hook's own slice). */
    status: "proposed" | "withdrawn";
    /** The primary file the proposal touches. */
    path: string;
    /** The version fence: the expected version the proposal was made
     *  against (never absent - a proposal without a fence is never
     *  created; the refusal-to-guess). */
    version: string;
    /** The hook's own monotonic sequence (never a wall clock). */
    sequence: number;
    /** RENAME: the symbol's name as the graph knows it. */
    name?: string;
    /** RENAME: the new name. */
    to?: string;
    /** CONNECT: the source endpoint (`symbol` = the symbol name in the
     *  file; absent for the file itself). */
    from?: {
        path: string;
        symbol?: string;
    };
    /** CONNECT: the target endpoint. */
    target?: {
        path: string;
        symbol?: string;
    };
    /** CONNECT: the proposed edge kind (the W1 graph's two kinds plus the
     *  deferred reference kinds, which the graph may reject). */
    edge?: "contains" | "imports" | "references" | "calls" | "tests";
    /** REPLACE: the span to replace (1-based, inclusive). */
    span?: {
        startLine: number;
        endLine: number;
    };
    /** REPLACE: the replacement content for the span. */
    content?: string;
}
