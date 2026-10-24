Learning-Loop - the D8 decision/learning layer tests

The decision records, the follow-through outcome signal, the learned accept
rate, the pickable heuristics, and the storage fallback, against the fake
ctx, REAL temp workspaces and the REAL pattern service over a fake KV domain.

## Scenarios

- L1: a note - a temp pack with TWO equal-prior companions, so only the
  learned history can order them - is byte-exact and records a `pending`
  decision (the six pickable values, the enabled list, the effective weights,
  `store=memory`); touching a named companion records `accepted Version
  docs/CHANGELOG.md` for that companion and its family (the rate moves from
  the neutral 1/3 by the service's +0.1 accept move); after the turn boundary
  the next call ranks the accepted companion FIRST and its score rises.
- L2: a note whose window closes untouched - two judged calls do NOT close
  it, the third (the configured `learnWindow`) records `rejected Version 2
  companions` - moves the companions' rate by the -0.2 reject move; after the
  turn boundary the next note's score falls below the accepted-neutral 0.675.
- L3: the PICKABLE heuristics - disabling `literal` drops it from the enabled
  list, sets its effective weight to 0.00 and lowers the score to 0.55 (the
  `decided` line carries the table byte-exactly); a raised `prior` weight
  (0.50) raises the score to 0.825 and the line carries the raised table.
- L4: with NO pattern service the bounded memory fallback answers the neutral
  1/3, so the default score is the PoC's 0.675, and the decision record is
  kept in the fallback's ring.
- L5: the REAL pattern service stores the decision record (the weights line,
  the enabled line, `outcome pending`, the per-companion value lines) and the
  rate records; the accept fills the record's outcome (`accepted`) and moves
  the companion record's confidence; `Save` plus a SECOND service over the
  same KV tables restores both, and a reopened plugin instance reads the rate
  back, ranks the accepted companion first and reproduces the configured
  weights.

## Fixtures

The shared Harness: the fake ctx with a DISTINCT root object, the real
factory, the real built Target, a fresh temp `$HOME` (so the pattern
service's JSON fallback can never touch the real home), the REAL
`@playform/plugin-dsh-pattern` service over `FakeStorage` (the open capture,
the map-backed tables, the version fence), and the judged paths resolved
against a REAL temp workspace carrying its own `.dsh/pack.yml` signature.
No sleeps and no fake clock: the window is counted in judged calls, and the
service's `Flush`/`Save` are awaited before the reopen.

## Expected ledger strings (byte-exact, `hook-dsh-edit-suggester: ` prefix)

`decided Version 0.87 2 companions docs/STYLE.md
scope=1.00,graph=0.50,prior=0.60,literal=0.50,history=0.33,accept=0.33
weights scope=0.35,graph=0.00,prior=0.25,literal=0.25,history=0.15,accept=0.00
store=memory`, `accepted Version docs/CHANGELOG.md`,
`rejected Version 2 companions` (and the L3 variants with `literal=0.00` /
`prior=0.50` in the weights segment).

## Expected count

12 PASS.
