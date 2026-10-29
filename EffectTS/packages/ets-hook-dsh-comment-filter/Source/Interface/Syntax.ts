// Syntax - the per-language comment/string descriptor the strip transform
// consumes. A Variable-style table (Function/Detect) maps a file extension
// onto one of these, and the string-aware scanner (Function/Scan) uses it to
// tell a comment from what only looks like one.
//
// The shape is deliberately MINIMAL and purely structural: only what a
// line-oriented scanner needs, so the table stays auditable and a language
// family is one object literal, not a parser.
//
//   Line     - the line-comment tokens. Order within the list is
//              irrelevant (a token is matched at the current index); the
//              BLOCK tokens are always tested first by the scanner, so
//              `--[[` (lua) and `--` (sql/lua) never collide, and neither
//              do `/*` and `//`.
//   Boundary - the line token opens a comment only at the START of the line
//              or after whitespace (the hash family: YAML/TOML require it,
//              shell `${#var}` must survive, PHP `#[...]` must survive, and
//              Python's no-space `x=1#c` is under-stripped - the acceptable
//              direction).
//   Open /   - the block-comment delimiter pair, or absent. Never NESTED in
//   Close      v1 (the scanner closes on the FIRST Close token).
//   Backtick - backtick template literals are STRINGS (JS/TS/Go/Vue/Svelte).
//              They may span lines, so the scanner carries the state across
//              the body's numbered lines.
//   Triple   - Python triple-quoted strings (""" / ''') are STRINGS, never
//              comments: docstrings must survive the filter - they are the
//              thing the intent keywords are about. They may span lines, so
//              the state is carried.
//   Verbatim - C# verbatim strings (@"...") are STRINGS; their only escape
//              is a doubled quote (""), and a backslash is literal.
//   Ruby     - Ruby's full-line =begin/=end block markers: the whole
//              =begin..=end region is one comment span.
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
