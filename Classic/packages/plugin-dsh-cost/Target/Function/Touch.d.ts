/**
 * @module Touch
 *
 * The tool/call and tool/result parser: one tool/call event's name and
 * arguments string become the file interactions the call performs, resolved
 * against the session's working directory and normalized POSIX - and, for a
 * search-family tool, one tool/result event's discovered paths become one read
 * touch each.
 *
 * @remarks
 *
 * The parser follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section 1 and
 * `Temporary/Cost-Research/Backlog.md` E4. A search's argument is a scope (a
 * directory, a glob or a query), never a file, so it yields no touch of its
 * own: the files it found are the result's. A tool the ledger does not map, a
 * malformed or alien arguments string, and an absent or unreadable result yield
 * no touches; the parser never throws.
 *
 * The same file answers the two questions a content version needs (Backlog E7,
 * the research's section 4): Content is the whole new text a write's arguments
 * carry - exactly what the tool writes, so the file's after content - and
 * Rendered is the text a tool result returned, which is the content the model
 * actually received. Both are undefined when the call or the result does not
 * carry the file's own content, so no caller hashes a request, an error message
 * or a listing as though it were a file.
 */
type Kind = "read" | "write" | "edit" | "delete" | "search";
type Touched = {
    Path: string;
    Kind: Kind;
};
export declare const Search: (Tool: string) => boolean;
export declare const Content: (Tool: string, Arguments: string) => string | undefined;
export declare const Rendered: (Result: unknown) => string | undefined;
export default _default;
declare function _default(Name: string, Arguments: string, Cwd: string, Result?: unknown): readonly Touched[];
