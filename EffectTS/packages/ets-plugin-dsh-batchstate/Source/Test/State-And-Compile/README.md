# State-And-Compile - the write API and the compiler tests

The task/status/scope/queue/clear writes, the events, the ring cap, and the compiled presentation
blocks.

## Scenarios

- S1: the task writes - the byte-exact `task <agent>: <task>` lines, one `batch/state-change` event
  per write, `startedAt` stamped exactly once, and the member active.
- S2: the terminal status - the byte-exact `status <agent>: <status>` line, `finishedAt` stamped,
  the member dropped from the idle queue, and the completion appended to the ring with the exact
  shape.
- S3: the scope writes - the byte-exact `scope <agent>: <n> surfaces` line and the caller's list
  copied (never aliased).
- S4: the idle queue - the byte-exact `queued <agent> (position <n>)` lines, the positions, and a
  repeated call idempotent (no new line).
- S5: the completions ring - capped at `maxRecent`, newest first.
- S6: the compiled blocks - the context block byte-exact (the header, the RUNNING lanes with the
  OWNER lists, the IDLE line, the YOUR SCOPE / OFF-LIMITS line, the PENDING line), the scope view
  separating yours / shared / off-limits, the concurrent-lanes block excluding the caller (and the
  empty variant), the honest `unknown agent` scope, and the snapshot carrying the batch, the
  running, the idle, and the recent.
- S7: the reset - `cleared` byte-exact, everything emptied, and the clear event with the empty
  member id.

## Fixtures

The shared Harness with the event capture for `batch/state-change`.

## Expected ledger strings (byte-exact, `batchstate: ` prefix)

`task <agent>: <task>`, `status <agent>: <status>`,
`scope <agent>: <n> surfaces`, `queued <agent> (position <n>)`, `cleared`.

## Expected count

14 PASS.
