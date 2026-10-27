# Boards-And-Plants - the B-series smoke tests

The planted blocks (CAN-2) together with the I5 lease: the byte-exact board
frames, the report channels, the lease windows, and the lifecycle of close and
withdraw.

## Scenarios

- The board starts with the exact frame bytes (running/none rows, the total
  line, and the expect count), plus the byte-exact `plant opened` / `member
  enrolled` ledger lines.
- At the next assembly, the `[live-report]` splice pickup (G5) folds a report
  from a child into the row, and no parent tool call is necessary.
- The lease works as follows: three silent parent turns render the byte-exact
  `[stale]` row exactly once with `lease expired <plantId> <agentId> (after 3
  turns)`; any report folded in a turn resets the window; and a member that
  reports every turn never expires.
- Inside one reportRateMs window (I6/I5), two reports show the newest payload,
  and the lease resets one time per window.
- The failed row that comes from a settlement caused by a kill (the L6
  carrier).
- The overflow member shows `[unboarded]` and keeps no lease entry.
- Multi-level: two agents each hold a board with the same name, separately
  (per-agent scoping).
- After closeMs, the board close shows the byte-exact closing line for one
  request, and then it withdraws.
- When the parent stays silent past orphanBudgetMs, the orphan board declares
  the byte-exact STALE header on return.
- The todo-fill variant fills from the grammar of the todo report, and the
  aggregate variant folds the computed line.

## Expected count

17 PASS.
