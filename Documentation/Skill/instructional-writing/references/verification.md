# Verification: Byte-Checks and the Smokes as Arbiter

> Source: SKILL.md Section 4, expanded to full philosophy.

## The Rule

- After writing a fixture, verify it with a Python one-liner byte-check that
  scans the file for the expected codepoints: U+2014, U+2013, U+201C, U+2026,
  U+00A0, the zero-width range, and the fullwidth range U+FF01-U+FF5E.
- The byte-check is a READ-ONLY check. It reads bytes and reports. It is never
  an in-place rewrite: no code "fixes" the file by transforming it, because an
  in-place rewrite is exactly the normalization the discipline exists to
  prevent.
- The smokes' fixture assertions are the ARBITER: the smoke suites that assert
  on the fixture bytes are what makes the whole discipline enforceable, and
  they are the final word on whether a fixture is correct.

## Why (the full rationale)

- The write path can destroy characters silently; only reading the bytes back
  closes the loop. The one-liner is deliberately minimal: a short Python
  snippet that opens the file as bytes (or decodes it), checks for the
  codepoints the fixture claims, and prints the result. Its simplicity is the
  point - anyone can run it, and it has no moving parts to distrust.
- Read-only is not a stylistic preference. The failure being guarded against
  is a byte being silently transformed; a "repair" step that rewrites the file
  is itself a silent byte transformer with better intentions. The only lawful
  response to a failed byte-check is a new verbatim raw-write of the intended
  content.
- The smokes as arbiter means the discipline does not depend on any single
  agent's diligence. The smoke suites run in CI-like conditions, read the
  fixtures, and assert their byte content. If a fixture was written wrong, the
  smoke fails visibly; if the discipline is skipped, the corpus degrades and
  the next smoke run says so.

## The codepoints the checks cover

- U+2014 (em dash) and U+2013 (en dash): the dash transforms.
- U+201C (left double curly quote): the quote transforms (with its mirror
  U+201D and the single pair U+2018/U+2019 covered by the corpus).
- U+2026 (ellipsis): the ellipsis transform.
- U+00A0 (non-breaking space): the unicode-space transforms.
- The zero-width range (U+200B and neighbors): the invisible-character
  transforms.
- U+FF01-U+FF5E (fullwidth forms): the fullwidth transforms.

## Good vs bad

- GOOD: write the fixture verbatim, immediately run the byte-check one-liner
  over it, see every expected codepoint reported present, then let the smokes
  confirm the corpus.
- BAD: trusting the write because the call returned success. Success is about
  the call, not the bytes.
- BAD: a byte-check failure "fixed" by running a script that replaces the
  hyphens back with em dashes in place. That rewrites the file outside the
  verbatim path and is forbidden.
- BAD: writing a new byte-check that also rewrites, "for convenience".

## Exceptions

- None on read-only. Checking may be repeated as often as useful; rewriting
  through a checker is never allowed. The fix is always: recompose the
  intended content and re-issue the verbatim raw-write.

## Failure modes

- The check is run against the wrong path (see the absolute-paths reference)
  and reports success for a file that is not the fixture.
- The check list drifts from the inventory: a new character group is added to
  fixtures but not to the checks, so its absence goes unnoticed.
- The check passes but the file's prose claims a character the check does not
  cover; the claim-to-byte mapping (see the truthfulness reference) is the
  part that failed.

## Arbiters

- The byte-checks are the immediate, per-write arbiter.
- The smoke suites' fixture assertions are the standing, corpus-level arbiter.
- When the two disagree, the smokes win: they are the arbiter.
