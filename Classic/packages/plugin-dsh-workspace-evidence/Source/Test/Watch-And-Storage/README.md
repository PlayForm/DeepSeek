# Watch-And-Storage - the invalidation seam and the storage domain

This folder covers the fs/observed listener through the real root Wire and the P5-style storage domain: the guard chain, the persistence, the restart recovery, the loud open failure, the absent facility, and the purity.

## Scenarios

- W1: the domain spec is name `workspace_evidence`, version 1, layout
  `per-record`, invalidRecords `backup-and-skip`, two tables
  (`validations`, `meta`); the open binds the handle.
- W2: the validation record lands keyed by id; the sequence lands in the
  meta table.
- W3: the restart recovery - live records reload, superseded records
  drop, and the sequence continues at the recovered maximum (never a wall
  clock).
- W4: a failed open is loud - the exact
  `evidence: storage open failed: storage unavailable` line, and the
  service degrades to memory.
- W5: an absent facility is a silent skip - no line, no handle, the store
  lives in memory.
- W6: the guard chain, in order - the service's own actor is ignored
  (`ignored <path> (own actor)`), an excluded path is ignored
  (`ignored <path> (excluded)`), an absent observation does not
  invalidate (`ignored <path> (absent observation)`), a present
  observation invalidates the dependents (`stale <id> (dependency
  <path>)`), and a malformed event never throws
  (`failed unknown (malformed event: displayPath is not a string)`).
- W7: purity - the fake fs records ZERO writeText and readText calls.
- W8: the repeat-event guard (Function/Duplicate) - a repeat event for the
  same path carrying the same version within the coalescing window is
  dropped silently (one invalidation, no repeated `stale` or `no stale`
  line); a different version runs the pass normally; the same version after
  the window (via the `State.Now` clock seam) is processed again. The
  service's explicit `invalidate` calls are never guarded.

## Fixtures

The harness is the shared Harness: a fake storage facility with seeded records for the restart, the real built Target including the Storage module driven directly (the Monitors-Persist precedent), and the `State.Now` clock seam.

## Expected ledger strings (byte-exact, `evidence: ` prefix)

`storage open failed: <reason>`, `ignored <path> (...)`,
`stale <id> (dependency <path>)`,
`failed unknown (malformed event: displayPath is not a string)`.

## Expected count

17 PASS.
