// Strip - the per-call RAW marker remover: the stream-normalization family's
// opt-out convention. A tool call whose arguments JSON opens with the marker
// `{"__normalize":false` (the FIRST key) is RAW: its arguments pass through
// the family's tool-args gate UNNORMALIZED - and the marker entry itself must
// be REMOVED before the executed call reaches the tool, because the harness's
// tools validate their arguments with `additionalProperties: false` and would
// reject the unknown `__normalize` key. The marker opens in exactly two legal
// shapes, and the strip handles both:
//
//   {"__normalize":false,   →  {      the marker AND its separator comma are
//                                     removed; the call's real arguments
//                                     continue after the replaced prefix
//   {"__normalize":false}   →  {}     the marker alone → the empty object
//
// The pattern is anchored at the very start of the text (the marker must be
// the FIRST key - the opt-out is DECLARED at the opening brace, never
// discovered mid-arguments) and carries NO `g` flag, so this module-level
// constant is stateless (no `lastIndex` to share across calls or streams -
// the reason the char-class tables build their regexes per call is the `g`
// flag's `lastIndex`, which a non-global pattern does not have). Whitespace
// around the key and value is tolerated (`\s*`); anything else - a marker
// that is not the first key, a `true` value, a truncated marker - does not
// match and passes through untouched. The truncated marker IS a documented
// edge: a first arguments delta shorter than the whole marker leaves its
// split text invisible to any anchored strip.
//
// Pure: no match → the input string back UNCHANGED (identity); a match → a
// new string with only the marker entry removed. The replacement is a
// function replacer (the family convention - `Normalize/Replace`): no `$`
// pattern in the removed text can ever leak into the result, and the closer
// decides the shape (a comma is consumed; a closing brace is kept, turning
// the marker-only call into `{}`).
const Marker = /^(\{)\s*"__normalize"\s*:\s*false\s*(,|\})/;

export default (Text: string): string =>
	Text.replace(Marker, (_Match, Brace: string, Closer: string) =>
		Closer === "," ? Brace : Brace + Closer,
	);
