// Map — the char→char MAP replacer: apply one character→character mapping
// (the family's Normalize tables — Quotes, Fullwidth) to one text segment
// and count the replaced characters. Each character of the text that is a
// KEY of the mapping is replaced by its mapped value; the mapping value may
// be a MULTI-CHARACTER string (one character in, any string out), while the
// keys are single characters.
//
// The replacement is a FUNCTION replacer, not a string: a string replacement
// would interpret `$` patterns in a mapping value (e.g. `$&`), while the
// function form returns the mapped value literally — a table value is a
// literal string, always.
//
// The regex is constructed PER CALL from the mapping's keys, each escaped as
// an ES2015 code-point escape (`\u{...}`, valid under the `u` flag): no
// module-level global state (a shared `g` regex carries lastIndex across
// calls under concurrent use), and no raw character classes (a raw join of
// the keys would let a future table key like `]`, `^`, `-` or `\` corrupt
// the class; the code-point form is key-agnostic). The `g` + `u` flags make
// the class match by CODE POINTS, so the replacer receives exactly the key
// strings of the table.
//
// The lookup falls back to the matched character itself: the matched string
// IS a key of the mapping by construction, so the fallback is only the
// type-level shape of the index signature (`string | undefined`), never a
// behavioral branch.
//
// Returns `{ text, count }`; `count === 0` means "unchanged" and the caller
// keeps the original segment BY IDENTITY.
export default (Text: string, Map: Record<string, string>): { text: string; count: number } => {
	let Count = 0;
	return {
		text: Text.replace(
			new RegExp(
				`[${Object.keys(Map)
					.map((Key) => `\\u{${(Key.codePointAt(0) as number).toString(16)}}`)
					.join("")}]`,
				"gu",
			),
			(Match) => {
				Count += 1;
				return Map[Match] ?? Match;
			},
		),
		count: Count,
	};
};
