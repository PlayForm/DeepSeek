# State-And-Compile - the write API and the compiler tests

This folder covers the task/status/scope/queue/clear writes, the events, the ring cap, and the compiled presentation blocks.

## Scenarios

- S1: the task writes produce the byte-exact `task <agent>: <task>` lines, one `batch/state-change` event per write, `startedAt` stamped exactly once, and the member active.
- S2: the terminal status produces the byte-exact `status <agent>: <status>` line, `finishedAt` stamped, the member dropped from the idle queue, and the completion appended to the ring with the exact shape.
- S3: the scope writes produce the byte-exact `scope <agent>: <n> surfaces` line, and the caller's list is copied (never aliased).
- S4: the idle queue produces the byte-exact `queued <agent> (position <n>)` lines and the positions, and a repeated call is idempotent (no new line).
- S5: the completions ring is capped at `maxRecent`, newest first.
- S6: the compiled blocks are byte-exact: the context block (the header, the RUNNING lanes with the OWNER lists, the IDLE line, the YOUR SCOPE / OFF-LIMITS line, the PENDING line), the scope view separating yours / shared / off-limits, the concurrent-lanes block excluding the caller (and the empty variant), the honest `unknown agent` scope, and the snapshot carrying the batch, the running, the idle, and the recent.
- S7: the reset logs `cleared` byte-exact, empties everything, and emits the clear event with the empty member id.

## Fixtures

The fixtures use the shared Harness with the event capture for `batch/state-change`.

## Expected ledger strings (byte-exact, `batchstate: ` prefix)

`task <agent>: <task>`, `status <agent>: <status>`,
`scope <agent>: <n> surfaces`, `queued <agent> (position <n>)`, `cleared`.

## Expected count

14 PASS.
