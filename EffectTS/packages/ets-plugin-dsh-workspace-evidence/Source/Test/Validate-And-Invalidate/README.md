# Validate-And-Invalidate - the validation objects and the Acar seam

The suite tests the core behavior of the service against the fake ctx: the record shape, the fail-loud validation, the supersede path, the explicit invalidation, the store cap, and the read surface.

## Scenarios

- **V1.**

    The record carries the exact shape (id, kind, subject, verdict, dependencies, sequence, fresh status), and the exact line is `validated a (reality, the file on disk, 1 dependencies, unverified, sequence 1)`.

    Four fail-loud validation errors are byte-exact, and the service records a verified verdict as given and never invents one.

- **V2.**

    A revalidation supersedes the old record with the exact `superseded a (sequence 1)` line, and the store keeps only the latest record per id, because the supersede is the ledger line and not a second object.

- **V3.**

    The explicit invalidate makes the dependent record stale with the exact `stale a (dependency k)` line, and a key with no dependents logs the exact `no stale (dependency nothing)` line.

    The service never guesses a stale record back to fresh.

- **V4.**

    In the store cap the oldest record drops first, and the superseded records drop before the fresh ones.

- **V5.**

    The statistics pentuple is exact, and check() returns undefined for an unknown id.

## Fixtures

The shared Harness supplies the real built Target, and the test points the durable ledger at a nonexistent path so that this folder asserts only the logger lines.

## Expected ledger strings (byte-exact, `evidence: ` prefix)

`validated ...`, `superseded ...`, `stale ... (dependency ...)`,
`no stale (dependency ...)`.

## Expected count

13 PASS.
