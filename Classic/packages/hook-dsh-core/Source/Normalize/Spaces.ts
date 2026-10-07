// Spaces — the unicode SPACE-family character class: every visible
// non-terminator space that is NOT ASCII U+0020 and NOT a control, i.e.
// exactly Unicode's Zs category minus the ASCII space:
//
//   U+00A0  no-break space
//   U+1680  ogham space mark
//   U+2000–U+200A  en quad, em quad, en space, three-per-em space,
//                  four-per-em space, six-per-em space, figure space,
//                  punctuation space, thin space, hair space
//   U+202F  narrow no-break space
//   U+205F  medium mathematical space
//   U+3000  ideographic space
//
// (U+200B–U+200A's invisible zero-width neighbours live in the Invisible
// table; U+FEFF is there too — Zs-adjacent but a format character.)
//
// Carries the `g` flag per the family convention; the generic Replace never
// mutates it — it builds a fresh per-call regex from `source` alone.
export default /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g;
