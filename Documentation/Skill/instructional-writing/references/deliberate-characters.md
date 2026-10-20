# The Deliberate Character Inventory

> Source: SKILL.md Section 2, the full bullet list, expanded to full philosophy.

## The Rule

The instructional and fixture files carry the following literal characters,
each with its Unicode codepoint, so the family's normalization behavior has
real material to act on. The characters are named here by codepoint (this
reference file itself is ordinary documentation and stays pure ASCII; the
fixture files are where the literal characters live).

The inventory:

- Em dash - U+2014
- En dash - U+2013
- Left single curly quote - U+2018
- Right single curly quote - U+2019
- Left double curly quote - U+201C
- Right double curly quote - U+201D
- Single horizontal ellipsis - U+2026
- Non-breaking space - U+00A0
- Em quad / em space - U+2003
- Ideographic space - U+3000
- En quad - U+2000
- Zero-width space - U+200B
- Soft hyphen - U+00AD
- Left-to-right mark - U+200E
- Right-to-left mark - U+200F
- Word joiner - U+2060
- Zero-width no-break space / BOM - U+FEFF
- Fullwidth forms - U+FF01 through U+FF5E (the exclamation mark U+FF01 and
  the question mark U+FF1F are the commonly used representatives)

## Why (the full rationale)

- Each inventory entry corresponds to one of the six normalization transform
  families: dashes (U+2014, U+2013), curly quotes (U+2018-U+201D), the
  ellipsis (U+2026), unicode spaces (U+00A0, U+2000, U+2003, U+3000),
  invisible characters (U+00AD, U+200B, U+200E, U+200F, U+2060, U+FEFF), and
  fullwidth forms (U+FF01-U+FF5E). The inventory is therefore exactly the set
  of codepoints needed to exercise every transform the family applies.
- Naming the codepoints matters practically: the byte-checks in the
  verification step search for these exact codepoints, and a fixture missing
  one of them silently stops covering its transform.
- The list is deliberately comprehensive rather than minimal. A minimal
  fixture would prove the pipeline works on one character; a comprehensive one
  proves every branch of the transform, which is what the smokes assert.

## Good vs bad

- GOOD: a fixture whose body contains at least one representative of every
  inventory group, written verbatim, with prose that truthfully says which
  characters are present.
- BAD: a fixture that only carries an em dash and nothing else - it under-covers
  the inventory and weakens the smokes that count on the full set.
- BAD: an inventory entry included as a prose mention only ("the file talks
  about non-breaking spaces") without the literal character present. The
  mention must correspond to a real codepoint in the file's bytes.

## Exceptions

- A fixture may target a subset deliberately when its purpose is narrow (for
  example, a dash-only demo), but the family's broad-coverage fixtures and the
  verification byte-checks assume the full inventory is available in the
  corpus. A narrow fixture should say so in its purpose line.

## Failure modes

- Hand-typing a lookalike: an en dash typed as a hyphen, a curly quote typed
  straight, an ideographic space typed as a run of ASCII spaces. The file
  reads the same to the eye and fails the byte-checks.
- Composing the content in a context that already normalized it (for example,
  copying from an already-normalized file) - the characters are gone before
  the raw-write call is even made.
- Adding a character to the prose but not to the bytes, so the file's claims
  and its contents diverge (see the truthfulness reference).

## Arbiters

- The Python byte-checks in the verification step are the immediate arbiter:
  they confirm each expected codepoint is present where the file claims it.
- The smoke suites assert on the corpus-level inventory coverage.
