# Boards-And-Plants - the B-series smoke tests

The planted blocks (CAN-2) and the I5 lease: the byte-exact board frames, the report channels, the
lease windows and the close/withdraw lifecycle.

## Scenarios

- The board opens with the exact frame bytes (running/none rows, the total
  line, the expect count) and the byte-exact `plant opened` / `member
  enrolled` ledger lines.
- The `[live-report]` splice pickup (G5) folds the report of a child into the
  row at the next assembly without any parent tool call.
- The lease: three silent parent turns render the byte-exact `[stale]` row
  exactly once with `lease expired <plantId> <agentId> (after 3 turns)`; a
  report folded in any turn resets the window; a member reporting every turn
  never expires.
- The coalescing window (I6/I5): two reports in one reportRateMs window show
  the newest payload; the lease resets once per window.
- The failed row from a kill-caused settlement (the L6 carrier).
- The overflow member renders `[unboarded]` and holds no lease entry.
- Multi-level: two agents hold identically named boards separately (per-agent
  scoping).
- The board close after closeMs renders the byte-exact closing line for one
  request, then withdraws.
- The orphan board (parent silent past orphanBudgetMs) declares the byte-exact
  STALE header on return.
- The todo-fill variant fills from the todo report grammar; the aggregate
  variant folds the computed line.

## Expected count

17 PASS.
