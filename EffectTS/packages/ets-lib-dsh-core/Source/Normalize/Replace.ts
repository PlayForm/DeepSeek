// Replace — the GENERIC class→string replacer: apply one character-CLASS
// regex (the family's Normalize tables — Dashes, Ellipsis, Spaces,
// Invisible) to one text segment and count the replaced characters.
//
// The replacement is a FUNCTION replacer, not a string: a string replacement
// would interpret `$` patterns in a custom config value (e.g. `$&`), while
// the function form returns `To` literally — a config value is a literal
// string, always.
//
// The regex is constructed PER CALL from `Class.source` with the `gu` flags:
// no module-level global state (a shared `g` regex carries lastIndex across
// calls under concurrent use), and the CALLER's regex object is never
// mutated — a fresh `new RegExp` keeps the caller's own `lastIndex` at zero
// no matter how many segments are transformed. The caller passes its table
// WITH the `g` flag (the family convention — a per-character class applied
// across the whole segment); the per-call construction takes only the
// `source` and re-supplies `g` itself, plus `u` so the class matches by
// CODE POINTS (the tables are BMP-only verbatim patterns — `u`-valid, and
// behaviorally identical for them, while making any future astral table
// member a single match instead of two lone surrogates).
//
// Returns `{ text, count }`; `count === 0` means "unchanged" and the caller
// keeps the original segment BY IDENTITY.
export default (Text: string, Class: RegExp, To: string): { text: string; count: number } => {
	let Count = 0;
	return {
		text: Text.replace(new RegExp(Class.source, "gu"), () => {
			Count += 1;
			return To;
		}),
		count: Count,
	};
};
