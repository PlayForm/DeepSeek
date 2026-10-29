// Scan - the STRING-AWARE, line-oriented comment scanner: one line of code
// text in, the same line with its comment spans removed plus the number of
// spans removed out. It is the only place in the plugin that decides "is this
// really a comment", and its bias is stated once, loudly:
//
//   UNDER-STRIPPING IS ACCEPTABLE; OVER-STRIPPING (CORRUPTING CODE) IS NOT.
//
// So every construct that can CONTAIN comment-looking bytes is treated as a
// string first, and every ambiguous token is left alone:
//
//   * `"` and `'` strings (backslash escapes honored; an unterminated quote
//     swallows the rest of the line but is NOT carried across lines - a Rust
//     lifetime or an apostrophe would otherwise suppress stripping for the
//     rest of the file);
//   * backtick template literals (JS/TS/Go/Vue/Svelte), carried across lines;
//   * Python triple-quoted strings (""" / ''') - docstrings are STRINGS and
//     survive; carried across lines;
//   * C# verbatim strings (@"..."), where "" is the escaped quote;
//   * an ESCAPED line token is literal text (`\%` in TeX, `\#` in shell);
//   * the hash family's word boundary (see Interface/Syntax's Boundary);
//   * PHP's `#[` attribute opener is never a comment.
//
// Block comments are removed from their opening token through their closing
// token and are carried across lines (the body window may start inside one);
// line comments are removed from their token to the end of the line. The
// count is the number of spans that START in this line: a multi-line block
// comment counts ONCE, at the line where it opens.
//
// Deliberate v1 blind spots (documented, not hidden): regex literals, JSX
// text, Rust raw strings (r#"..."#), Lua long strings ([[...]]), and shell
// `${...}` expansions are not modeled as strings. The first three only make
// the scanner MISS a comment (under-strip); `${#var}` is protected by the
// hash boundary. The mission's string list is the contract; this list is the
// honest edge of it.
//
// Pure per line: the only mutation is the caller's Mark (the carry state).
import type Mark from "@Interface/Mark.js";
import type Syntax from "@Interface/Syntax.js";

/** The end index of a normal quoted string, or -1 (backslash escapes). */
const QuoteEnd = (Text: string, From: number, Quote: string): number => {
	for (let Index = From; Index < Text.length; Index += 1) {
		switch (true) {
			case Text[Index] === "\\":
				Index += 1;
				break;
			case Text[Index] === Quote:
				return Index;
		}
	}
	return -1;
};

/** The end index of a C# verbatim string, or -1 ("" is the escaped quote). */
const VerbatimEnd = (Text: string, From: number): number => {
	for (let Index = From; Index < Text.length; Index += 1) {
		switch (true) {
			case Text[Index] === '"' && Text[Index + 1] === '"':
				Index += 1;
				break;
			case Text[Index] === '"':
				return Index;
		}
	}
	return -1;
};

/**
 * Is there a line-comment token at `Index`? The guards are the conservative
 * ones from the header: no escaped token, no boundary violation, no PHP
 * attribute opener.
 */
const LineComment = (Text: string, Index: number, Syntax: Syntax): boolean => {
	for (const Token of Syntax.Line) {
		switch (true) {
			case Token.length === 0:
				continue;
			case !Text.startsWith(Token, Index):
				continue;
			// An escaped token is literal text (`\%`, `\#`), not a comment.
			case Text[Index - 1] === "\\":
				continue;
			// The hash family's word boundary: start of line or after
			// whitespace only (YAML/TOML require it; shell `${#var}` and PHP
			// `#[...]` must survive).
			case Syntax.Boundary === true && Index > 0 && !/\s/u.test(Text[Index - 1] as string):
				continue;
			// PHP 8 attributes: `#[` is never a comment.
			case Token === "#" && Text[Index + 1] === "[":
				continue;
			default:
				return true;
		}
	}
	return false;
};

export default (Text: string, Syntax: Syntax, Mark: Mark): { text: string; count: number } => {
	let Output = "";
	let Count = 0;
	let Index = 0;
	while (Index < Text.length) {
		switch (true) {
			// (1) THE CONTINUATIONS: a comment or string opened on an earlier
			// line of the same text block. Nothing here can start a new span
			// except the Ruby =end line, which ends the span counted at =begin.
			case Mark.Ruby === true: {
				switch (true) {
					case Text.startsWith("=end"):
						Mark.Ruby = false;
				}
				Index = Text.length;
				break;
			}
			case Mark.Block !== undefined: {
				const Close = Mark.Block as string;
				const End = Close === "" ? -1 : Text.indexOf(Close, Index);
				switch (true) {
					case End < 0:
						// Still inside the block: the rest of the line is removed.
						Index = Text.length;
						break;
					default:
						Index = End + Close.length;
						Mark.Block = undefined;
				}
				break;
			}
			case Mark.Triple !== undefined: {
				const Delimiter = Mark.Triple as string;
				const End = Text.indexOf(Delimiter, Index);
				switch (true) {
					case End < 0:
						Output += Text.slice(Index);
						Index = Text.length;
						break;
					default:
						Output += Text.slice(Index, End + Delimiter.length);
						Index = End + Delimiter.length;
						Mark.Triple = undefined;
				}
				break;
			}
			case Mark.Backtick === true: {
				const End = QuoteEnd(Text, Index, "`");
				switch (true) {
					case End < 0:
						Output += Text.slice(Index);
						Index = Text.length;
						break;
					default:
						Output += Text.slice(Index, End + 1);
						Index = End + 1;
						Mark.Backtick = undefined;
				}
				break;
			}
			// (2) The Ruby full-line block opener (=begin must open the line).
			case Syntax.Ruby === true && Index === 0 && Text.startsWith("=begin"): {
				Count += 1;
				Mark.Ruby = true;
				Index = Text.length;
				break;
			}
			// (3) THE STRINGS: copied verbatim, never scanned for comments.
			case Syntax.Triple === true &&
				(Text.startsWith('"""', Index) || Text.startsWith("'''", Index)): {
				const Delimiter = Text.slice(Index, Index + 3);
				const End = Text.indexOf(Delimiter, Index + 3);
				switch (true) {
					case End < 0:
						Output += Text.slice(Index);
						Mark.Triple = Delimiter;
						Index = Text.length;
						break;
					default:
						Output += Text.slice(Index, End + Delimiter.length);
						Index = End + Delimiter.length;
				}
				break;
			}
			case Syntax.Verbatim === true && Text.startsWith('@"', Index): {
				const End = VerbatimEnd(Text, Index + 2);
				switch (true) {
					case End < 0:
						Output += Text.slice(Index);
						Index = Text.length;
						break;
					default:
						Output += Text.slice(Index, End + 1);
						Index = End + 1;
				}
				break;
			}
			case Syntax.Backtick === true && Text[Index] === "`": {
				const End = QuoteEnd(Text, Index + 1, "`");
				switch (true) {
					case End < 0:
						Output += Text.slice(Index);
						Mark.Backtick = true;
						Index = Text.length;
						break;
					default:
						Output += Text.slice(Index, End + 1);
						Index = End + 1;
				}
				break;
			}
			case Text[Index] === '"' || Text[Index] === "'": {
				const Quote = Text[Index] as string;
				const End = QuoteEnd(Text, Index + 1, Quote);
				switch (true) {
					case End < 0:
						Output += Text.slice(Index);
						Index = Text.length;
						break;
					default:
						Output += Text.slice(Index, End + 1);
						Index = End + 1;
				}
				break;
			}
			// (4) THE BLOCK COMMENT: tested BEFORE the line tokens, so `/*`
			// never loses to `//`, `--[[` never loses to `--`, `<#` to `#`.
			case Syntax.Open !== undefined && Text.startsWith(Syntax.Open, Index): {
				const Open = Syntax.Open as string;
				const Close = Syntax.Close ?? "";
				Count += 1;
				const End = Close === "" ? -1 : Text.indexOf(Close, Index + Open.length);
				switch (true) {
					case End < 0:
						Mark.Block = Close;
						Index = Text.length;
						break;
					default:
						Index = End + Close.length;
				}
				break;
			}
			// (5) THE LINE COMMENT: removed from its token to the line's end.
			case LineComment(Text, Index, Syntax): {
				Count += 1;
				Index = Text.length;
				break;
			}
			// (6) Ordinary code bytes are copied verbatim.
			default: {
				Output += Text[Index];
				Index += 1;
			}
		}
	}
	return { text: Output, count: Count };
};
