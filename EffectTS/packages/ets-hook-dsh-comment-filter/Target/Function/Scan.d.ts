/**
 * @module Scan
 *
 * The string-aware, line-oriented comment scanner: one line of code text in,
 * the same line with its comment spans removed plus the number of spans
 * removed out.
 *
 * @remarks
 * It is the only place in the plugin that decides "is this really a
 * comment", and its bias is stated once, loudly:
 *
 * UNDER-STRIPPING IS ACCEPTABLE; OVER-STRIPPING (CORRUPTING CODE) IS NOT.
 *
 * So every construct that can CONTAIN comment-looking bytes is treated as a
 * string first, and every ambiguous token is left alone:
 * - `"` and `'` strings (backslash escapes honored; an unterminated quote
 *   swallows the rest of the line but is NOT carried across lines - a Rust
 *   lifetime or an apostrophe would otherwise suppress stripping for the
 *   rest of the file).
 * - Backtick template literals (JS/TS/Go/Vue/Svelte), carried across lines.
 * - Python triple-quoted strings - docstrings are STRINGS and survive;
 *   carried across lines.
 * - C# verbatim strings (`@"..."`), where a doubled double quote is the
 *   escaped quote.
 * - An ESCAPED line token is literal text (`\%` in TeX, `\#` in shell).
 * - The hash family's word boundary (see Interface/Syntax's Boundary).
 * - PHP's `#[` attribute opener is never a comment.
 *
 * Block comments are removed from their opening token through their closing
 * token and are carried across lines (the body window may start inside one);
 * line comments are removed from their token to the end of the line. The
 * count is the number of spans that START in this line: a multi-line block
 * comment counts ONCE, at the line where it opens.
 *
 * Deliberate v1 blind spots (documented, not hidden): regex literals, JSX
 * text, Rust raw strings (`r#"..."#`), Lua long strings (`[[...]]`), and
 * shell `${...}` expansions are not modeled as strings. The first three only
 * make the scanner MISS a comment (under-strip); `${#var}` is protected by
 * the hash boundary. The mission's string list is the contract; this list is
 * the honest edge of it.
 *
 * Pure per line: the only mutation is the caller's Mark (the carry state).
 */
import type Mark from "../Interface/Mark.js";
import type Syntax from "../Interface/Syntax.js";
export default _default;
declare function _default(Text: string, Syntax: Syntax, Mark: Mark): {
    text: string;
    count: number;
};
