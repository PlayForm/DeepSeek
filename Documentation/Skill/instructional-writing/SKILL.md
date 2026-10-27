---
name: instructional-writing
description:
    "Writing files whose point is literal typographic characters the normalize hooks would rewrite:
    fixtures, demo before/after pairs, instructional prose. Raw-write is the only writer; glyphs are
    never replaced with ASCII stand-ins and the notes stay truthful."
whenToUse:
    Writing or editing a fixture, byte-faithful copy, demo pair showing a curly quote or em dash, or
    any file whose point is the exact glyph; also when a written glyph arrives as ASCII.
version: 2.0.0
updated: 2026-10-20
---

# Instructional Writing

The normalize hooks rewrite streamed text: dashes become hyphens, curly quotes become straight, the
ellipsis becomes three dots, unicode spaces become ASCII.

That is the product for ordinary prose.

Some files exist because the glyph itself is the subject - a fixture proving the transform, a demo
showing before and after.

Those files are written with `raw-write`, and their characters are never replaced with stand-ins.

## When to use

- A fixture whose bytes are asserted by a suite.
- A demo pair: raw input and normalized output side by side.
- Instructional prose that says "this file contains an em dash" and must be true.
- A byte-faithful copy of an existing file.
- Do not use for: ordinary prose, code, or docs. Those are ASCII, written with `write`
  (`code-authoring`).

## The rules

1. **The writer.**

    `raw-write` is the only writer.

    It is exempt from normalization by name.

    A plain `write` would destroy the deliberate characters.

2. **The read.**

    `raw-write` refuses to overwrite a file it has not seen in the session.

3. **The paths.**

    `raw-write` resolves relative paths against the profile root, not the current directory.

4. **The flags.**

    `normalize` absent or false writes verbatim; `true` applies all six transforms; an array applies
    the named flavors.

    `govern` routes a manifest write through the direct-govern chain.

5. **The stand-in.**

    A deliberate character is never replaced with an ASCII stand-in.

    The file's value is the byte.

    A "safe" substitution turns the fixture into a lie.

6. **The notes.**

    A claim about a character must match the bytes; the `write` tool would normalize the claim's own
    glyph.

7. **The verification.**

    A byte check proves the characters arrived; the suite that consumes the fixture is the final
    arbiter.

8. **The exclusivity.**

    Do not copy a fixture into a second location; the archive is the single source.

## The character inventory

| Family    | Examples                            | Transform       |
| --------- | ----------------------------------- | --------------- |
| Dash      | em dash, en dash, horizontal bar    | `-`             |
| Quotes    | curly single and double, low quotes | straight quotes |
| Ellipsis  | horizontal ellipsis (U+2026)        | `...`           |
| Spaces    | no-break, en/em space, thin space   | plain space     |
| Invisible | soft hyphen, zero-width, bidi, BOM  | removed         |
| Fullwidth | U+FF01-FF5E forms                   | ASCII halfwidth |

## Decision table

| The file's value is...                    | Writer           |
| ----------------------------------------- | ---------------- |
| Ordinary text or code                     | `write`          |
| The exact glyph (fixture, copy, demo)     | `raw-write`      |
| A literal replacement in an existing file | `edit`           |
| A whole-file normalization                | `normalize-file` |

## Verification

- The byte check shows the expected code points in the file.
- The note and the bytes agree.
- The consuming suite passes; its fixture assertions are the arbiter.

## Anti-patterns

| Mistake                                  | Cost                                      | Do instead         |
| ---------------------------------------- | ----------------------------------------- | ------------------ |
| Plain `write` for a fixture              | The glyphs become ASCII; the fixture lies | `raw-write`        |
| ASCII stand-in in a demo                 | The demo no longer shows the transform    | The real character |
| A note that says "em dash" over a hyphen | The file contradicts itself               | Match the bytes    |
| Relative path to `raw-write`             | It resolves against the profile root      | Absolute path      |

## References

| File                                    | Covers                                                   | Read when                     |
| --------------------------------------- | -------------------------------------------------------- | ----------------------------- |
| `references/raw-write.md`               | The tool's semantics, flags, paths, and read-first       | Writing a byte-faithful file  |
| `references/fixtures-and-characters.md` | The fixture archives, the codepoint table, and the notes | Adding or verifying a fixture |
