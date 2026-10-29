export default interface Syntax {
    /** The line-comment tokens (e.g. ["//"], ["#"], ["--"], [";"]). */
    Line: readonly string[];
    /** The line token needs a word boundary (start of line or whitespace). */
    Boundary?: boolean | undefined;
    /** The block-comment opening token ("/*", "<!--", "{-", ...). */
    Open?: string | undefined;
    /** The block-comment closing token (the star-slash pair, "-->", "-}", ...). */
    Close?: string | undefined;
    /** Backtick template literals are strings (JS/TS/Go/Vue/Svelte). */
    Backtick?: boolean | undefined;
    /** Python triple-quoted strings (""" / ''') are strings, not comments. */
    Triple?: boolean | undefined;
    /** C# verbatim strings (@"...") are strings. */
    Verbatim?: boolean | undefined;
    /** Ruby full-line =begin/=end comment blocks. */
    Ruby?: boolean | undefined;
}
