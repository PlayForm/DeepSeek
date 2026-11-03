Learning-Loop - the D8 decision and learning layer tests

The suite covers the decision records, the follow-through outcome signal, the learned accept rate, the
pickable heuristics, and the storage fallback, against the fake ctx, REAL temp workspaces, and the
REAL pattern service over a fake KV domain - with the candidates coming from the seeded session
history (the synthetic `History` family), never from a built-in pack literal.

## Scenarios

- L1: a note from a seeded session history whose TWO companions carry the
  same prior (0.6, the History family's prior), so only the learned history
  can order them, is byte-exact and records a `pending` decision with the six
  pickable values, the enabled list, the effective weights, and
  `store=memory`.
- L1 continues: reading a named companion records
  `accepted History docs/REFERENCE.md` for that companion and its family,
  where the rate moves from the neutral 1/3 by the +0.1 accept move of the
  service, and a later call from a second agent (the learned layer is per
  instance) ranks the accepted companion FIRST and its score rises.
- L2: a note whose window closes untouched stays open after two judged calls,
  the third call, which is the configured `learnWindow`, records
  `rejected History 2 companions`, and the companions' rate moves by the
  -0.2 reject move, so after the turn boundary the next score falls below the
  neutral 0.675.
- L3: the PICKABLE heuristics work, because disabling `literal` drops it from
  the enabled list, sets its effective weight to 0.00, and lowers the score
  to 0.55, with the `decided` line carrying the table byte-exactly, and a
  raised `prior` weight of 0.50 raises the score to 0.825 with the raised
  table in the line.
- L4: with NO pattern service the bounded memory fallback answers the neutral
  1/3, so the default score is the PoC's 0.675, and the decision record is
  kept in the ring of the fallback.
- L5: the REAL pattern service stores the decision record (the weights line,
  the enabled line, `outcome pending`, and the per-companion value lines) and
  the rate records, and the accept fills the outcome of the record with
  `accepted` and moves the confidence of the companion record.
- L5 continues: `Save` plus a SECOND service over the same KV tables restores
  both, and a reopened plugin instance reads the rate back, ranks the
  accepted companion first, and reproduces the configured weights.

## Fixtures

The shared Harness supplies the fake ctx with a DISTINCT root object, the real factory, the real built
Target, and a fresh temp `$HOME`, so the JSON fallback of the pattern service can never touch the real
home.

The REAL `@playform/plugin-dsh-pattern` service runs over `FakeStorage`, which gives the open capture,
the map-backed tables, and the version fence, and the judged paths resolve against a REAL temp
workspace whose `package.json` marks the pack-independent root and whose `docs/STYLE.md` and
`docs/REFERENCE.md` are the two equal-prior history companions.

The session history is seeded through the `__hookDshDocSuggesterState` probe (the shape the
`tools/post-execute` fold writes), so the suite does not need a session bus; the judged calls the
suite makes join that history too (reads included), and the fixtures name the anchor for the calls
that only age the window.

No sleeps and no fake clock run, because the window is counted in judged calls and `Flush`/`Save` of
the service are awaited before the reopen.

## Expected ledger strings (byte-exact, `hook-dsh-doc-suggester: ` prefix)

`decided History 0.87 2 companions docs/STYLE.md
scope=1.00,graph=0.50,prior=0.60,literal=0.50,history=0.33,accept=0.33
weights scope=0.35,graph=0.00,prior=0.25,literal=0.25,history=0.15,accept=0.00
store=memory`, `accepted History docs/REFERENCE.md`,
`rejected History 2 companions` (and the L3 variants with `literal=0.00` /
`prior=0.50` in the weights segment).

## Expected count

12 PASS.
