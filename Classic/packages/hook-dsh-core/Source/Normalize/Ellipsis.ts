// Ellipsis — the single HORIZONTAL ELLIPSIS character class (U+2026), the
// typographic three-dot run collapsed into one code point by text
// processors. The class form (a one-member character class) keeps every
// table in this directory shape-identical: a per-character class handed to
// the generic Replace, whose consumer chooses the replacement (e.g. the
// ASCII `...` three-dot sequence — a MULTI-character replacement, which is
// why this table goes through the class→string replacer and not the
// char→char map).
//
// Carries the `g` flag per the family convention; the generic Replace never
// mutates it — it builds a fresh per-call regex from `source` alone.
export default /[\u2026]/g;
