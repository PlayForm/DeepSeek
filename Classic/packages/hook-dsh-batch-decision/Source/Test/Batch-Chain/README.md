# Batch-Chain - the end-to-end batch chain (the wave-1 acceptance proof)

One process, one shared fake context, the REAL built libraries of all five
packages:

```
pass-on.Prepare
  -> batch/proposed (the bus)            the decision hook records it,
                                         the ingester holds it
  -> the harness inbox (agent.inject)    the board splices it
  -> batch_decision (the user)           the hook decides
  -> the inbox (the decision block)      the board marks it approved
  -> batch/decision (the bus)            the ingester applies it
  -> the content fence                   the file changes
  -> ctx.feedback.Outcome                the council records the outcome
```

## Scenarios

- C1: the pass-on prepares the batch and delivers it into the inbox (one
  `agent.inject`, the `[BATCH PROPOSAL - <id>]` envelope).
- C2: the board spliced the proposal with the byte-exact
  `batchstate: proposal <id> spliced (intent version-bump, targets 1, rev 1,
  origin agent-a)` line; the entry status is `proposed`.
- C3: the decision hook recorded the proposal (byte-exact line) and the
  ingester holds it.
- C4: the approval applied the change through the content fence (one
  `applied` journal record for the target).
- C5: the decision reached the board through the inbox - the status is
  `approved`, with the byte-exact board and hook handoff lines.
- C6: the hook logged the decision and the ingester handoff byte-exactly.
- C7: the batch outcome fed the feedback journal (`event: batch`) and the
  session's summary (`outcomes`).
- C8: the same decision was applied exactly once (the claim held: one edit,
  one `applied` record).
- C9: the pass-on's delivery journaled the inbox handoff byte-exactly.

## Fixtures

The chain harness: one bus with a multi-listener registry, one service
registry behind `Context.get`, the real factory, the real built library of
every package, a capturing governed fs, and a fake agent registry whose
`inject` mirrors the harness's own inbox commit (the durable
`agent/inbox/spliced` event plus the live `agent/inbox/inserted` emit). No
sleeps: the ingester's `WhenIdle` drains the apply.

## Expected ledger strings (byte-exact)

`batchstate: proposal <id> spliced (intent version-bump, targets 1, rev 1, origin agent-a)`,
`batchstate: proposal <id> decided approved (by user)`,
`hook-dsh-batch-decision: proposal <id> recorded (intent version-bump, targets 1, rev 1)`,
`hook-dsh-batch-decision: decision approved <id> (by user)`,
`hook-dsh-batch-decision: inbox <id>: delivered to agent-a`,
`hook-dsh-batch-decision: handoff <id>: applied 1, conflicts 0, recovery 0`,
the ingester's `applied` record, the pass-on's `delivered` / `inbox agent-a`
record, and the feedback's `batch` / `applied` record.

## Expected count

9 PASS.
