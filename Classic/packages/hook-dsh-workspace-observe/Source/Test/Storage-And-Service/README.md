# Storage-And-Service - the storage domain and the service tests

The hook's own KV domain (open, persistence, recovery, cap) and the
`workspaceObserve` service surface, including the ZERO file-mutation
guarantee.

## Scenarios

- S1: the open captures the byte-exact domain spec - name
  `workspace_observe` (the config domain), version 1, layout `per-record`,
  invalidRecords `backup-and-skip`, two tables (`stamps`, `ring`); the open
  binds the handle.
- S2: the record persistence - the latest stamps land in the `stamps` table
  keyed by path with the exact stamp shape, the ring snapshot lands in the
  `ring` table under the meta key `__ring`.
- S3: the restart recovery - a fresh state against the same store rebuilds
  the latest map and the ring, and the sequence continues at the recovered
  maximum (exactly 3 after two recovered stamps), never a wall clock.
- S4: the persisted ring is capped at `maxStamps`; the latest map is not
  capped.
- S5: the manual path - resolve through ctx.fs, stat for the version
  (`manual /repo/src/a.ts version 9` byte-exact, origin `manual`), and an
  absent target records version `absent` honestly.
- S6: the fake fs records ZERO `writeText` and ZERO `readText` calls across
  a full scenario (events + manual + storage) - the hook never reads file
  content and never writes a file (B10).
- S7: an absent facility is a silent skip - the effect is armed, the handle
  stays undefined, the stamps live in memory, and no storage failure line
  appears.
- S8: a present facility whose open fails is LOUD - the byte-exact
  `storage open failed: <reason>` line and the handle stays undefined.
- S9: the service counts both origins in `statistics()` and `stamp()`
  resolves the manual latest.

## Fixtures

The shared Harness plus `FakeStorage` (the fake facility: the captured spec,
the per-table maps, the read surface, the fail-open mode) and `OpenStorage`
(the direct call of the module the effect drives, the Monitors-Persist
precedent).

## Expected ledger strings (byte-exact, `observe: ` prefix)

`manual <path> version <version>`, `storage open failed: <reason>`.

## Expected count

14 PASS.
