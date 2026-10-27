# Watch-And-Storage - the invalidation seam and the storage domain

The suite tests the fs/observed listener through the real root Wire and the P5-style storage domain: the guard chain, the persistence, the restart recovery, the loud open failure, the absent facility, and the purity.

## Scenarios

- **W1.**

    The domain spec has the name `workspace_evidence`, version 1, layout `per-record`, invalidRecords `backup-and-skip`, and two tables (`validations`, `meta`), and the open binds the handle.

- **W2.**

    The validation record lands keyed by id, and the sequence lands in the meta table.

- **W3.**

    In the restart recovery the live records reload, the superseded records drop, and the sequence continues at the recovered maximum, never at a wall clock.

- **W4.**

    A failed open is loud with the exact `evidence: storage open failed: storage unavailable` line, and the service degrades to memory.

- **W5.**

    An absent facility is a silent skip: no line, no handle, and the store lives in memory.

- **W6.**

    The guard chain runs in order: the service's own actor is ignored (`ignored <path> (own actor)`), an excluded path is ignored (`ignored <path> (excluded)`), and an absent observation does not invalidate (`ignored <path> (absent observation)`).

    A present observation invalidates the dependents (`stale <id> (dependency <path>)`), and a malformed event never throws (`failed unknown (malformed event: displayPath is not a string)`).

- **W7.**

    The purity check confirms that the fake fs records ZERO writeText and readText calls.

- **W8.**

    In the repeat-event guard (Function/Duplicate) a repeat event for the same path that carries the same version within the coalescing window is dropped silently: one invalidation, with no repeated `stale` or `no stale` line.

    A different version runs the pass normally, and the same version after the window (via the `State.Now` clock seam) is processed again.

    The service's explicit `invalidate` calls are never guarded.

## Fixtures

The shared Harness supplies a fake storage facility with seeded records for the restart, the real built Target including the Storage module driven directly (the Monitors-Persist precedent), and the `State.Now` clock seam.

## Expected ledger strings (byte-exact, `evidence: ` prefix)

`storage open failed: <reason>`, `ignored <path> (...)`,
`stale <id> (dependency <path>)`,
`failed unknown (malformed event: displayPath is not a string)`.

## Expected count

17 PASS.
