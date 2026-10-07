// Invisible — the zero-width / invisible character class: the format and
// joiner characters that carry no visible width and frequently smuggle
// hidden instructions into model output:
//
//   U+00AD         soft hyphen
//   U+200B         zero-width space
//   U+200C         zero-width non-joiner
//   U+200D         zero-width joiner
//   U+200E         left-to-right mark
//   U+200F         right-to-left mark
//   U+202A–U+202E  LRE, RLE, PDF, LRO, RLO (the bidi embedding controls;
//                  U+202E is the classic visual spoofing override)
//   U+2060         word joiner
//   U+FEFF         zero-width no-break space (the BOM character)
//
// Carries the `g` flag per the family convention; the generic Replace never
// mutates it — it builds a fresh per-call regex from `source` alone.
export default /[\u00AD\u200B\u200C\u200D\u200E\u200F\u202A-\u202E\u2060\uFEFF]/g;
