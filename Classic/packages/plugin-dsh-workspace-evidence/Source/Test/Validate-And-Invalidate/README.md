# Validate-And-Invalidate - the validation objects and the Acar seam

The service's core behavior against the fake ctx: the record shape, the
fail-loud validation, the supersede path, the explicit invalidation, the
store cap, and the read surface.

## Scenarios

- V1: the record carries the exact shape (id, kind, subject, verdict,
  dependencies, sequence, fresh status); the exact
  `validated a (reality, the file on disk, 1 dependencies, unverified,
  sequence 1)` line; four byte-exact fail-loud validation errors; a
  verified verdict is recorded as given, never invented.
- V2: a revalidation supersedes the old record (the exact
  `superseded a (sequence 1)` line; the store keeps only the latest record
  per id - the supersede is the ledger line, not a second object).
- V3: the explicit invalidate - the dependent record goes stale with the
  exact `stale a (dependency k)` line; a key with no dependents logs the
  exact `no stale (dependency nothing)` line; a stale record is never
  guessed back to fresh.
- V4: the store cap - the oldest record drops first; the superseded drop
  before the fresh.
- V5: the statistics pentuple is exact; check() returns undefined for an
  unknown id.

## Fixtures

The shared Harness (real built Target; the durable ledger pointed at a
nonexistent path so only the logger lines are asserted in this folder).

## Expected ledger strings (byte-exact, `evidence: ` prefix)

`validated ...`, `superseded ...`, `stale ... (dependency ...)`,
`no stale (dependency ...)`.

## Expected count

13 PASS.
