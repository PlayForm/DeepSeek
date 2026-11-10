/**
 * @module Touch
 *
 * The tool/call and tool/result parser (Documentation/Plans/
 * COST-TRACK-PLUGIN.md section 1, Temporary/Cost-Research/Backlog.md E4):
 * one tool/call event's name and arguments string become the file
 * interactions the call performs, resolved against the session's working
 * directory and normalized POSIX - and, for a search-family tool, one
 * tool/result event's discovered paths become one read touch each.
 *
 * @remarks
 *
 * A search's argument is a scope (a directory, a glob or a query), never a
 * file, so it yields no touch of its own: the files it found are the
 * result's. A tool the ledger does not map, a malformed or alien arguments
 * string, and an absent or unreadable result yield no touches; the parser
 * never throws.
 *
 * The same file answers the two questions a content version needs (Backlog
 * E7, the research's section 4): Content is the whole new text a write's
 * arguments carry - exactly what the tool writes, so the file's after
 * content - and Rendered is the text a tool result returned, which is the
 * content the model actually received. Both are undefined when the call or
 * the result does not carry the file's own content, so no caller hashes a
 * request, an error message or a listing as though it were a file.
 */
/**
 * One file interaction's kind.
 */
type Kind = "read" | "write" | "edit" | "delete" | "search";
/**
 * One parsed file interaction.
 */
type Touched = {
    Path: string;
    Kind: Kind;
};
/**
 * The search family: the tools whose argument names a scope and whose
 * files are the result's. The classification is KindOf's own, so a tool
 * the vocabulary gains as a search is discovered without a second list.
 */
export declare const Search: (Tool: string) => boolean;
/**
 * The content a tool call's arguments carry as the file's whole new text: a
 * write's own "content" field is exactly what the tool writes, so it is the
 * one argument a version may hash as the file's after content. Every other
 * tool's arguments carry a request rather than a result - an edit's two
 * fragments, a patch body, a batch's operation table - so they yield
 * undefined, and so does a malformed, alien or non-string content: a caller
 * records no version rather than hashing what it cannot confirm.
 */
export declare const Content: (Tool: string, Arguments: string) => string | undefined;
/**
 * The rendered text a tool result returned, or undefined when the result
 * carries none: the text blocks of the tool-role message are exactly the
 * content the model received, so an absent or empty body is unreadable
 * evidence rather than an empty file.
 */
export declare const Rendered: (Result: unknown) => string | undefined;
export default _default;
declare function _default(Name: string, Arguments: string, Cwd: string, Result?: unknown): readonly Touched[];
