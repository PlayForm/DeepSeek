# The Mandate: Why Instructional Files Carry Typographic Characters

> Source: SKILL.md introductory paragraph (the mandate of 2026-10-07), expanded to full philosophy.

## The Rule

Some files in this family are INSTRUCTIONAL or FIXTURE files: their purpose is to
carry literal typographic and other "normalizable" characters - the kinds of
characters the family's normalization behavior would normally rewrite. For these
files the family's usual normalization discipline is deliberately set aside, and
this skill is the operating manual for writing them correctly.

The mandate is dated 2026-10-07. It establishes two layers:

1. A HARD RULE about which tool writes these files: they are written with the
   raw-write tool ONLY - its verbatim path. The normalized write would destroy
   the deliberate characters.
2. A STYLE RULE about what these files may say: a file that claims to contain a
   character ("this file has an em dash") must actually contain that literal
   character. The instructional notes stay truthful.

## Why (the full rationale)

- The family's normalization is a byte-level transform applied to model output
  streams. You cannot prove, demonstrate, or test a byte-level transform without
  inputs that actually contain the bytes it transforms. The instructional and
  fixture files ARE those inputs - they are the family's positive test vectors
  for its own normalization behavior.
- If every file in the repo were normalized, the normalization step would have
  nothing observable to act on, and any claim that "the family normalizes dashes
  to the module's replacement" would be unfalsifiable inside the repo itself.
  These files make the behavior observable and therefore checkable.
- The files double as documentation: a reader who opens the file sees the real
  characters next to prose explaining what they are, so the skill teaches both
  the characters and the discipline in one place.
- The mandate is a user directive, not a derived preference. It is not
  re-litigated per task: when a file is instructional/fixture, the discipline
  applies in full, every time, with no case-by-case negotiation.

## Good vs bad

- GOOD: a fixture markdown file whose body contains a real em dash (U+2014), a
  real curly quote pair (U+201C/U+201D), a real ellipsis (U+2026), written via
  the verbatim path, and whose prose truthfully names what it contains.
- BAD: the same file written through the normalized write - the em dash arrives
  as a hyphen, the curly quotes arrive straight, the ellipsis arrives as three
  periods, and the file now lies about its own contents.
- BAD: deciding "this one small file does not really need the discipline" and
  writing it with the plain write anyway. There is no size threshold; the
  discipline attaches to the file's role, not its length.

## Exceptions

- None at the level of the mandate. Every file whose role is instructional or
  fixture is covered. Tool-level exceptions (for example, a raw-write call that
  intentionally passes a normalize selection to demonstrate the transform's
  OUTPUT) are covered in the dedicated references and are themselves part of the
  discipline, not exemptions from it.

## Failure modes

- Writing the file with the plain write and not noticing, because the model that
  composed the content had already avoided the characters (so the transform is a
  no-op and nothing looks wrong - but the file no longer demonstrates anything).
- "Helpfully" replacing a character with its ASCII stand-in inside a quoted
  instructional note, which converts a truthful note into a false one.
- Assuming the discipline is only about dashes. It covers the whole normalizable
  character inventory (see the dedicated reference on the character inventory).

## Arbiters

- The family's smoke suites, which read the fixture files and assert on their
  bytes, are the final arbiter that the discipline was followed.
- The Python byte-checks described in the verification reference confirm the
  presence of the expected codepoints after every write.
