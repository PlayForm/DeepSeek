# Raw-Write Is the Only Writer for These Files

> Source: SKILL.md Section 1, rules 1 and 2, expanded to full philosophy.

## The Rule

- The raw-write tool is EXEMPT from the family's stream normalization by name:
  its arguments carry a file path, and that name exemption puts it outside the
  normalization applied to other tool traffic. It writes the content VERBATIM
  by default.
- The plain write tool NORMALIZES the content before it lands on disk.
- Therefore: any instructional or fixture file that must carry literal
  typographic characters is written with raw-write ONLY. Never with the plain
  write. There is no exception that runs through the plain write.

## Why (the full rationale)

- The family normalizes tool traffic so that stray typographic characters in
  ordinary output do not survive into ordinary files. That is the correct
  default for everything else the agent writes. The exemption for raw-write
  exists precisely so that the one class of files that must KEEP those
  characters has a lawful path to disk.
- The two tools are therefore complements, not competitors: raw-write is the
  "byte-faithful" writer, the plain write is the "normalized" writer. Choosing
  the writer IS the decision that determines whether the characters survive.
- Because the normalization happens on the write path, a mistake is silent at
  write time: the call succeeds, the file exists, only the bytes are wrong.
  That is why the tool choice is a hard rule stated up front, not a style
  suggestion to be checked afterwards.

## What the transforms do (what you are avoiding)

The normalization applied on the plain-write path includes, in its fixed order:
dashes are rewritten to the module's replacement, curly quotes become straight
quotes, the ellipsis character becomes three periods, unicode spaces become
ASCII spaces, invisible characters are removed, and fullwidth forms become
their halfwidth counterparts. Every one of these rewrites destroys exactly the
characters the instructional files exist to carry.

## Good vs bad

- GOOD: composing the fixture content with the literal characters inline
  (em dash, curly quotes, ellipsis, non-breaking space, zero-width space,
  fullwidth forms) and issuing a single raw-write call with that content.
- BAD: issuing a plain write call with the same content. Every normalizable
  character in it is rewritten before the file lands.
- BAD: writing the file with the plain write but typing the characters as ASCII
  stand-ins "to be safe". This produces an ASCII file that claims to be a
  fixture - the worst failure, because nothing errors and the file is simply
  not a fixture.
- BAD: writing the file with raw-write but passing a normalize selection,
  unless the file is deliberately a demonstration of the transform's output
  (see the dedicated reference on the raw-write flags).

## Exceptions

- None that pass through the plain write. The only lawful way to put these
  characters on disk is raw-write with no normalize selection (the verbatim
  default), or raw-write with an explicit selection when the file's purpose is
  to show the normalized result.

## Failure modes

- The call succeeds and the file looks plausible, but a byte-check finds the
  em dash missing: the write went through the normalized path.
- The model paraphrases the content "for clarity" while writing, dropping the
  characters. Verbatim means verbatim: the content as composed, characters
  included.
- Mixing writers: writing the file once with raw-write and later "touching it
  up" with the plain write. Any later plain-write edit re-normalizes the whole
  content and undoes the original discipline.

## Arbiters

- The byte-checks after the write (see the verification reference) are the
  immediate arbiter.
- The smoke suites that assert on fixture bytes are the standing arbiter.
