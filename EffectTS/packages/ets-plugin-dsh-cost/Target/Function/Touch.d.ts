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
