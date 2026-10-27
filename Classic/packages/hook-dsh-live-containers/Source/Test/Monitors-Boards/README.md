# Monitors-Boards - the wave-3 M-series board tests

The plantType "monitors" board (the CAN-2 reuse, with no new seam): the rows
that come from the monitor settles of the members, the `[live-report]
monitored` fold, the SKIP GUARD, and the lifecycle for ordinary settles that
stays unchanged.

## Scenarios

- R1: a monitor check settle from a member folds into the monitors board's row
  for that path - `[monitored] <path> - <outcome> by <writer>`, where the
  writer is the writer of the checked version; the SKIP GUARD: the member's
  TASK row is NOT flipped by its own monitor settle (a check is not a
  completion).
- R2: the `[live-report] <plantId> <agentId> monitored <outcome> <path>`
  fold - the outcome word comes first (clean | problem | stale | not-run |
  infra | denied), and the path stays whole (paths with spaces parse).
- R3: ordinary (non-monitor) job settles still flip the member's row - the
  guard is narrow, and the phase-2 board semantics stay intact.
- R4: `live_plant` accepts the `monitors` plantType; an unknown plantType
  still fails loud with the extended list.

## Fixtures

The shared Harness plus the wave-3 fixtures; the member's monitor job is a
real dispatch through the fake registry, so the settled event carries the
`monitor` kind and the fold runs exactly as it does in production.

## Expected ledger strings (byte-exact, `live-containers: ` prefix)

`plant opened <id> (expect <n>)`, `member enrolled <id> <agentId>`,
`report <id> <agentId> (<n> bytes)` (the existing board lines cover the
fold), plus the monitor lines from the Jobs series.

## Expected count

7 PASS.
