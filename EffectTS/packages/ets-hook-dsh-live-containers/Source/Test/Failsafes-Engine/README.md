# Failsafes-Engine - the F-series smoke tests

The CAN-4 failsafe engine: the eight scenarios per the channel table, the
"not even notifying" posture, and the meta-budget. The hang and the
live-timeout live in the deadline scan; the delegation stall in the I5 lease
(covered in Boards-And-Plants); the admission guard and the meta-budget in
Policy; the retry loop in Detach.

## Scenarios

- F1: the build hang - zero new output bytes past `hangBudgetMs` produces the
  byte-exact ledger line; `hangAction: "kill"` additionally kills through the
  registry with reason `live-hang`; `warn-only` (the default) never kills.
- F2: the meta-budget - with `failsafesPerTurn: 1`, the second detach of the
  same turn passes through inline and logs one summary line
  `failsafe meta-budget (<turn>)`; the next turn re-arms the budget.
- F3: the retry loop - the third dedup hit (failsafes on) extends the marker
  with the byte-exact `(3rd attempt)` line and logs `failsafe retry-loop <cmd>`.
- F4: the drift guard - while a live board is open, a session shape crossing
  the threshold gains the WARN line in the section (channel 4) and the ledger
  line.
- F5: the wave-2 section collapse - wave-2 parts exceeding the budget collapse
  to one-line summaries with `failsafe section-collapse <n>`.
- F6: with `failsafes: "off"` (the default) - zero behavior modification:
  no hang ledger, no meta-budget enforcement, no prune, no retry-loop
  extension, no drift line (the "not even notifying" posture, provable).

## Fixtures

The shared Harness plus the wave-2 fixtures; the deadline scan is driven by
firing a jobs output event or by an assemble pass (the checkpoint design).

## Expected count

10 PASS.
