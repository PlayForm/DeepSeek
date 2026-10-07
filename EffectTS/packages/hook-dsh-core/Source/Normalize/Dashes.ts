// Dashes — the unicode dash-family character class, the hermes dash pattern
// VERBATIM (the hermes normalize-dashes.sh regex, its
// perl -CSD form):
//
//   [\u058A\u05BE\u1400\u1806\u2010-\u2015\u2E17\u2E1A\u2E3A-\u2E3B\u2E40
//    \u2E5D\u301C\u3030\u30A0\uFE31-\uFE32\uFE58\uFE63\uFF0D]
//
// This is the normalize-dash hook's IDENTITY (the exact class its
// Function/Replace.ts carried before the pattern moved here): Armenian
// hyphen, right-to-left mark hyphen, Canadian syllabics hyphen, Katakana-
// Hiragana prolonged sound mark, the horizontal bar family, two-em/three-
// dash, wavy and vertical dashes, and the fullwidth hyphen-minus — all
// normalized to ASCII hyphen-minus by the Replace consumer.
//
// Carries the `g` flag per the family convention (a per-character class
// applied across the whole segment); the generic Replace never mutates it —
// it builds a fresh per-call regex from `source` alone.
export default /[\u058A\u05BE\u1400\u1806\u2010-\u2015\u2E17\u2E1A\u2E3A-\u2E3B\u2E40\u2E5D\u301C\u3030\u30A0\uFE31-\uFE32\uFE58\uFE63\uFF0D]/g;
