# Monitors-Boards - the wave-3 M-series board tests

The plantType "monitors" board (the CAN-2 reuse, with no new seam): the rows from the monitor settles
of the members, the `[live-report] monitored` fold, the SKIP GUARD, and the unchanged lifecycle for
ordinary settles.

## Scenarios

- R1: a member's monitor check settle folds into the monitors board's row
  for that path - `[monitored] <path> - <outcome> by <writer>` with the
  writer being the checked version's writer; the SKIP GUARD: the member's
  TASK row is NOT flipped by its own monitor settle (a check is not a
  completion).
- R2: the `[live-report] <plantId> <agentId> monitored <outcome> <path>`
  fold - the outcome word first (clean | problem | stale | not-run | infra
  | denied), the path kept whole (paths with spaces parse).
- R3: ordinary (non-monitor) job settles still flip the member's row - the
  guard is narrow, the phase-2 board semantics intact.
- R4: `live_plant` accepts the `monitors` plantType; an unknown plantType
  still fails loud with the extended list.

## Fixtures

The shared Harness plus the wave-3 fixtures.

The monitor job of the member is a real dispatch through the fake registry, so the settled event
carries the `monitor` kind and the fold runs exactly as in production.

## Expected ledger strings (byte-exact, `live-containers: ` prefix)

`plant opened <id> (expect <n>)`, `member enrolled <id> <agentId>`,
`report <id> <agentId> (<n> bytes)` (the existing board lines cover the
fold), plus the monitor lines from the Jobs series.

## Expected count

7 PASS.
