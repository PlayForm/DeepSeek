# Fixture Conventions: Locations, Purpose Lines, Proof Style

> Source: SKILL.md Section 3 (all three bullets), expanded to full philosophy.

## The Rule

- Live fixtures live under Test/ in the family repository. Archived fixtures
  of the family live in two named folders: fixtures-md/ for markdown proofs
  and fixtures/ for manifest/Cargo fixtures.
- The archive holds ONLY the family's fixtures. It is not a dumping ground for
  incidental demos; a file that is not one of the family's fixtures does not
  belong there.
- Each fixture carries a short purpose line in its content, stating what
  demonstrates what: "the RAW call", "the verbatim path", "the normalize
  selection". A Test/README.md keeps an index of what each file is for.
- The proof style is fixed: a fixture states what it proves plus the expected
  byte-state, in the pattern "EVERY character above survives in this file
  byte-for-byte", and the Python byte-checks (see the verification reference)
  confirm it after the write.

## Why (the full rationale)

- Locations: a fixture's value depends on something finding it. The smokes
  read Test/ and the archived folders by convention; a well-written fixture
  in the wrong directory is a dead asset. The two-way split of the archive
  (markdown proofs vs manifest/Cargo fixtures) mirrors the two kinds of
  material the family demonstrates: prose documents and configuration files.
- Exclusivity: the archive's authority comes from containing exactly the
  family's fixtures. One stray demo file in it forces every consumer to
  re-verify what each entry is, which defeats the point of a canonical
  corpus.
- Purpose lines: fixtures are read by future agents who were not present when
  they were written. The purpose line is the file's self-documentation; the
  README index is the corpus-level map. Together they let a new session
  understand and extend the corpus without archaeology.
- Proof style: a proof that does not state its expected result cannot be
  checked mechanically. The fixed pattern ("EVERY character above survives in
  this file byte-for-byte") gives the byte-checks a definite assertion to
  confirm, and gives a human reviewer a definite claim to eyeball.

## Good vs bad

- GOOD: a markdown fixture in fixtures-md/ whose first lines name its purpose
  ("demonstrates the verbatim path for a prose proof") and whose closing
  pattern asserts byte-survival, verified by the byte-checks.
- BAD: a demo script's output file parked in fixtures/ because it was handy.
  It does not carry a purpose line, it is not one of the family's fixtures,
  and it dilutes the corpus.
- BAD: a fixture that demonstrates the characters but never states the
  expected byte-state. It cannot fail visibly, so it proves nothing.
- BAD: a fixture added to Test/ or the archive without an entry in the
  Test/README.md index, leaving the map out of sync with the territory.

## Placement guidance

- New markdown proof: fixtures-md/.
- New manifest or Cargo fixture: fixtures/.
- Anything consumed live by a running test right now: Test/.
- When a live fixture matures into a permanent proof, copy it into the archive
  with its purpose line intact.

## Exceptions

- A deliberately narrow fixture (dash-only, quotes-only) is allowed, provided
  its purpose line says what subset it covers; the corpus-level coverage is
  what the smokes check.

## Failure modes

- The purpose line was written for the before/after pair's before half, and
  the after half was created by copying without updating the line.
- The README index says a file demonstrates "the full inventory" but the file
  was later narrowed; index and file disagree.
- A proof pattern was reworded into vagueness ("characters should generally
  survive"), making the assertion uncheckable.

## Arbiters

- The byte-checks confirm the stated byte-state after every write.
- The smoke suites treat the locations and the README index as contract.
- Corpus reviews (human or agent) check exclusivity: every archived file is
  genuinely one of the family's fixtures, with a purpose line and an index
  entry.
