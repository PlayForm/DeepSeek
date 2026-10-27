# Monitors-Persist - the wave-3 M-series storage tests

The monitor storage domain (the plugin's own P5-style open): the domain spec,
the record shapes, the pre-bind buffer, the absent facility, the loud open
failure, and the recovery.

## Scenarios

- P1: the open captures the byte-exact domain spec - name
  `live_containers_monitors`, version 1, layout `per-record`, invalidRecords
  `backup-and-skip`, one `checks` table; an open that succeeds binds the sink
  and sets the persistence flag.
- P2: the record shapes through the sink - the pre-bind queue (records fired
  before the open) drains on success, and the enrolled/check/retired shapes
  stay intact.
- P3: the pre-bind queue is capped at 256 records (the factory Queue
  pattern).
- P4: with no facility the clean result lives in memory only; after a lossy
  restart the band renders `not run yet (∅?)`, never a clean that is
  fabricated (the R3 scenario 6 honesty).
- P5: an open that fails logs `monitors storage open failed: <reason>`
  byte-exact and degrades (the sink retired, the queue dropped).
- P6: the recovery - the persisted result rebuilds the entry with provenance
  "recovered"; `monitor recovered <path> (<n> checks)` is byte-exact; the
  band renders the not-re-checked clause.
- P7: a recovered result older than `staleMs` renders the time-stale form.
- P8: an empty store recovers nothing, and the band stays honest.

## Fixtures

The shared Harness plus `FakeStorage` (the fake facility: the captured spec,
the record map, the read surface, the fail-open mode) and `OpenStorage` (the
direct call of the module that the Apply effect drives).

## Expected ledger strings (byte-exact, `live-containers: ` prefix)

`monitors storage open failed: <reason>`, `monitor recovered <path>
(<n> checks)`.

## Expected count

13 PASS.
