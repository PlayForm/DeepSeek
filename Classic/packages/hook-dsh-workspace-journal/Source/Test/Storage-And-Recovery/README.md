# Storage-And-Recovery - the storage domain and the restart recovery

This folder covers the byte-exact domain spec (name/version/layout/invalidRecords/three tables), the batch/entry/ring persistence, the restart recovery with the rebuilds, the validation filter, the absent facility (silent skip), the loud open failure, and the effect's disposer closing the handle.

## Scenarios

- S1: the domain spec is name/version/layout/invalidRecords and the three tables (batches, entries, ring), and the open binds the handle.
- S2: the batch record lands keyed by batchId, the entries keyed batchId:path, and the ring snapshot under the meta key `__ring`.
- S3: the restart recovery rebuilds batches, entries, and ring from the store, and the recovered batch still progresses on observed writes.
- S4: a record failing validation is skipped, never guessed.
- S5: with no facility the effect is a silent skip (no line, batches in memory), while a failed open logs the byte-exact `storage open failed: storage unavailable` and degrades.
- S6: the effect's disposer closes the open handle and clears it.

## Expected ledger strings (byte-exact, `journal: ` prefix)

`storage open failed: storage unavailable`;
`observed /a in b1 (progress 1)`.

## Expected count

11 PASS.
