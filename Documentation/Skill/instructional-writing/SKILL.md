---
name: instructional-writing
description: THE discipline for instructional and test-fixture writing in the DeepSeek Harness Plugin Family project - the files that deliberately carry typographic characters (em-dashes, en-dashes, curly quotes, ellipsis, unicode spaces, zero-width chars, fullwidth forms) to prove or demonstrate the family's normalization behavior. Hard rules: such files are written with the raw-write tool ONLY (its verbatim path - the normalized write would destroy the deliberate characters); the deliberate characters are NEVER replaced with ASCII stand-ins; the "this file has an em dash" style instructional notes stay truthful (the literal character is present). Load before writing any instructional or fixture file.
whenToUse: Mandatory before creating or editing ANY instructional file, test fixture, or demo example that is supposed to contain literal typographic characters (em/en dashes, curly quotes, ellipsis, unicode spaces, zero-width characters, fullwidth forms). If you are about to write such a file with the plain write tool (which normalizes the content) or replace a deliberate em-dash with a hyphen, STOP and use the raw-write tool with the literal characters.
---

# Instructional Writing - Operating Manual

The DeepSeek Harness Plugin Family normalizes model output: em-dashes and
friends become ASCII. The project's instructional files and test fixtures
therefore do the OPPOSITE deliberately - they carry the literal typographic
characters so the normalization behavior can be proven, demonstrated, and
kept honest. User-mandated 2026-10-07.

## 1. The raw-write tool (the only writer for these files)

1. The `raw-write` tool is name-exempt from the family's stream
   normalization and writes VERBATIM by default. It is the ONLY writer for
   any instructional/fixture file that must carry literal typographic
   characters.
2. A plain `write` call's content is normalized BEFORE the file lands -
   em-dashes become hyphens, curly quotes become straight, ellipsis
   becomes "...". NEVER use it for these files.
3. `raw-write` refuses to overwrite a file it has not seen: READ the
   target first, then raw-write.
4. `raw-write`'s relative paths resolve against the profile root, not the
   session workspace - pass ABSOLUTE paths for files outside the profile.
5. The optional `normalize` flag applies the family's six transforms to
   the content before writing (the reverse of this discipline - only when
   a file is meant to demonstrate the normalization result). The `govern`
   flag routes manifest writes through the governance chain.

## 2. The deliberate characters (kept literal, always)

The instructional/fixture files carry these characters DELIBERATELY:

- The em-dash (U+2014) and the en-dash (U+2013) - the dash family's
  subjects;
- Curly quotes (U+2018/2019/201C/201D) - the quotes flavor's subjects;
- The ellipsis (U+2026);
- Unicode spaces (U+00A0, U+2003, U+3000...);
- Zero-width/invisible characters (U+00AD, U+200B-D/E/F, U+2060, FEFF...);
- Fullwidth forms (U+FF01-FF5E).

The instructional notes stay TRUTHFUL: a line that says "this file has an
em dash" has the literal em dash present - never a hyphen standing in.

## 3. The fixture conventions

1. The live fixtures live under
   `~/Developer/Application/PlayForm/DeepSeek/Test/` (the archived family
   fixtures: `fixtures-md/` for the markdown proofs, `fixtures/` for the
   manifest/Cargo fixtures). The archive holds ONLY the family's fixtures.
2. Each fixture's purpose is one line in its content ("the RAW call",
   "the verbatim path", "the normalize selection"...) plus the `Test/
   README.md` index.
3. The proof style: the fixture states what it proves + the expected
   byte-state ("EVERY character above survives in this file
   byte-for-byte"), then the verification (the python byte-checks for the
   literal characters) confirms it.

## 4. The verification

1. After writing a fixture with literal characters, verify with a python
   one-liner: the character counts (U+2014/U+2013/U+201C/U+2026/U+00A0/
   the zero-width range/FF01-FF5E) are present where the file claims them.
2. The verification is a read-only check (python reading the bytes) -
   never an in-place rewrite.
3. The smokes' fixture assertions (where they read the fixture files) are
   the arbiter - the fixtures' bytes are part of the tested contract.

## 5. The demo/example corollary

The site's and READMEs' "In Action" examples follow the same rule: the
BEFORE-states carry the literal characters (the demonstration of what the
family transforms), the AFTER-states the normalized ASCII. The literal
characters land via the raw-write tool (or the exempt-edit pattern for the
subagents whose streams still normalize), never via a plain normalized
write.