# Dispatch-And-Board - the dispatcher tests

This folder covers the deterministic order, the seat bookkeeping, the state machine, the board line, the routed dispatch, the volatile flips, and the tools.

## Scenarios

- D1: the deterministic order - priority descending first (`queue-2` with
  p5 before `queue-1` with p0), FIFO on ties, and seats accumulating on `main`.
- D2: the child cap - a named agent gets exactly two dispatches, the third
  returns undefined, and the seat count stays 2 (the two-active regime).
- D3: the state machine - `dispatched -> running` (Start), the terminal
  arms Complete/Fail/Interrupt with the byte-exact `<state> <id> (<agent>)`
  lines, the result hash recorded on completion, seats released, and a
  queued task refusing to settle (no flip, no line).
- D4: the dependency gate - a p9 task with an unsatisfied dependency waits
  behind a p0 task and unblocks only after the dependency completes.
- D5: the board line - `QUEUE: 0 pending - next: none - running: 0/10
  (main seats 0)` empty and `QUEUE: 1 pending - next: queue-1 - running:
  1/10 (main seats 1)` active, byte-exact.
- D6: the routed dispatch - no `dshRoute` means unrouted; a present service
  resolves `deepseek glm-5.3-flash high` onto the task and the line; a
  throwing Resolve is fail-open (dispatch still happens); `routedDispatch:
  false` skips the route even with the service present.
- D7: the volatile hot-edit flips - firing the loader event without a
  committed flip changes nothing; the enabled flip lands in place and the
  tool refuses; the capacity flip lands without a remount.
- D8: the tools - `queue_enqueue` answers `{ok, id, state}` and
  `queue_status` answers with the board and the task list; Snapshot agrees
  with the status tool.

## Fixtures

The harness is the shared Harness with the `dshRoute` seam attach and the `Flip` volatile writer (the cosmokit write symbol).

## Expected ledger strings (byte-exact, `plugin-dsh-queue: ` prefix)

`dispatched <id> -> <agent>[ route <p> <m> <e>]`, `running <id>`,
`completed <id> (<agent>)`, `failed <id> (<agent>)`,
`interrupted <id> (<agent>)`.

## Expected count

20 PASS.
