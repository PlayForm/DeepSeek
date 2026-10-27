# Failsafes-Engine - the F-series smoke tests

The CAN-4 failsafe engine: the eight scenarios from the channel table, the "not
even notifying" posture, and the meta-budget. The hang and the live-timeout
belong to the deadline scan; the delegation stall to the I5 lease (covered in
Boards-And-Plants); the admission guard and the meta-budget to Policy; the
retry loop to Detach.

## Scenarios

- F1: the build hang - when no new output bytes arrive past `hangBudgetMs`, the
  engine writes the byte-exact ledger line; `hangAction: "kill"` also kills
  through the registry with reason `live-hang`; and `warn-only` (the default)
  never kills.
- F2: the meta-budget - with `failsafesPerTurn: 1`, the second detach in the
  same turn goes through inline and logs one summary line `failsafe
  meta-budget (<turn>)`; the next turn arms the budget again.
- F3: the retry loop - the third dedup hit (failsafes on) adds the byte-exact
  `(3rd attempt)` line to the marker and logs `failsafe retry-loop <cmd>`.
- F4: the drift guard - while a live board is open, a session shape that
  crosses the threshold gets the WARN line in the section (channel 4) and the
  ledger line.
- F5: the wave-2 section collapse - wave-2 parts that exceed the budget become
  one-line summaries with `failsafe section-collapse <n>`.
- F6: with `failsafes: "off"` (the default) - no behavior change: no hang
  ledger, no meta-budget enforcement, no prune, no retry-loop extension, and
  no drift line (the "not even notifying" posture, provable).

## Fixtures

The shared Harness plus the wave-2 fixtures; a jobs output event or an assemble
pass drives the deadline scan (the checkpoint design).

## Expected count

10 PASS.
