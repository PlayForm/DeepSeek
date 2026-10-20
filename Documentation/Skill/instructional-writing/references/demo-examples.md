# Demo Examples: Before and After Content Follows the Same Law

> Source: SKILL.md Section 5, expanded to full philosophy.

## The Rule

The "In Action" demo examples on the site and in READMEs obey the same law as
the fixtures: the BEFORE states carry the literal characters (the em dash, the
curly quotes, the ellipsis), and the AFTER states are normalized ASCII.

The landing rule for the before states: the literal characters land via the
raw-write tool (the verbatim path) - or via the exempt-edit pattern for
subagents whose streams still normalize - and never via a plain normalized
write.

## Why (the full rationale)

- A demo example is a fixture with an audience: it teaches the same transform
  with the same materials, so it must be built from the same ingredients. If
  the before state of a demo carried no real characters, the demo would show
  ASCII going in and ASCII coming out - a demonstration of nothing.
- The before/after pairing is what makes the transform visible: real U+2014 in
  the before, the plain hyphen in the after, side by side. This only works if
  the before state was preserved byte-accurately, which is why the demo
  content shares the fixture discipline rather than having its own.
- The exempt-edit clause exists for the multi-agent reality of this family:
  some subagents' output streams still pass through normalization. For them,
  the raw-write-style exemption is achieved through an edit path that is
  likewise exempt from stream normalization. The point is not which tool
  carries the bytes but that SOME lawful, normalization-exempt path carries
  them; a plain write never does.

## Good vs bad

- GOOD: a README demo whose "before" block was written via the verbatim path
  and shows real U+2014/U+201C/U+2026, and whose "after" block shows the
  normalized ASCII result, clearly labeled.
- BAD: a demo whose before block was plain-written, so before and after look
  identical and the demo quietly demonstrates nothing.
- BAD: hand-simulating the after state by typing hyphens and straight quotes
  while also plain-writing the before state - a demo assembled entirely from
  stand-ins that never touches the real transform.
- GOOD: a subagent whose stream normalizes contributes demo content via the
  exempt-edit pattern, and the resulting file passes the byte-checks.

## Assembly guidance

- Write the before state first, via the verbatim path, and verify it with the
  byte-checks (see the verification reference) before composing the after
  state.
- Derive the after state from the actual transform output (for example, a
  raw-write call with the normalize selection applied to the same content),
  not from imagination, so the pair is reproducible.
- Label the pair explicitly: which block is before, which is after, and what
  transform produced the after.

## Exceptions

- The after state is not required to carry typographic characters - it is
  required to be the honest normalized result. The law applies to the before
  state's bytes and to the truthfulness of both states' labels.

## Failure modes

- The before and after blocks were swapped or mislabeled during assembly, inverting
  the lesson.
- A site rebuild regenerated demo content through a normalizing pipeline,
  silently normalizing the before states; the byte-checks on the source
  files are what catch it.
- A subagent "helpfully" rewrote a before block through a plain write during a
  README edit; the exempt-edit pattern exists precisely for that situation.

## Arbiters

- The byte-checks on the before-state source files.
- The smoke suites where the demo content is covered by fixture assertions.
- Review of the published pair: the after state must be the transform's real
  output for the before state's real bytes.
