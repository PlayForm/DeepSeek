// Mark - the CARRY-ACROSS-LINES state of the comment scanner. The read
// tool's body is a sequence of numbered lines, and a comment or a string can
// open on one line and close on a later one (a `/* ... */` block comment, a
// Python `"""` docstring, a JS template literal, a Ruby =begin block). The
// scanner is line-oriented, so the state that must survive from one numbered
// line to the next lives in ONE mutable Mark object per text block
// (Function/Strip creates it, Function/Scan mutates it).
//
// Only the states whose semantics genuinely span lines are carried:
//
//   Block    - the open block comment's CLOSING token while inside one (the
//              body window may start inside a block comment, and the scanner
//              must remove the continuation, not parse it as code).
//   Triple   - the open Python triple-quoted string's delimiter.
//   Backtick - true while inside a JS/TS/Go template literal.
//   Ruby     - true while inside a Ruby =begin/=end block.
//
// Ordinary `"`/`'` strings are deliberately NOT carried: an unterminated
// quote is a per-line anomaly (Rust lifetimes and apostrophes are the common
// false positive), and carrying it would suppress stripping for the rest of
// the file - under-stripping is acceptable, a cascade is not.
export default interface Mark {
	/** The open block comment's closing token while inside one. */
	Block?: string | undefined;
	/** The open Python triple-quoted string's delimiter. */
	Triple?: string | undefined;
	/** True while inside a backtick template literal. */
	Backtick?: boolean | undefined;
	/** True while inside a Ruby =begin/=end block. */
	Ruby?: boolean | undefined;
}
