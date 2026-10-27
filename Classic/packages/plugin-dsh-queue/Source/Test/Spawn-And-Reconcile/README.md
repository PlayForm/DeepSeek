# Spawn-And-Reconcile - the spawn, the idle-slot automation and the restart reconcile

This is the completion wave's arbiter for `plugin-dsh-queue`: a queued task actually starts a subagent through the harness's own subagent service, the approval posture refuses, a released seat pulls the next task, the child's result settles the task, and the restart reconcile settles orphans honestly.

## Scenarios

- S1: THE SPAWN - one queued task starts EXACTLY ONE agent through
  `ctx.subagents.startActivation` with the spec verbatim
  (`[{ type: "text", text: "Build the parser" }]`), the configured provider
  (`spawn`), the task id as the label, `caller` delivery, the EXACT live
  parent from `ctx.agents.currentInitiator()`, and the spawn's own abort
  signal; the byte-exact `spawned queue-1 -> child-1` line, the `childId` on
  the task, the held seat, the board line, and the `task spawned` journal
  record.
- S2: THE APPROVAL POSTURE - `autoSpawn: false` (the shipped default) never
  calls the service and writes NO spawn line; the manual dispatch still
  assigns and ledgers the byte-exact `dispatched queue-1 -> main` line and
  still never spawns.
- S3: THE IDLE-SLOT AUTOMATION - a saturated pool (`capacity.main` 1) queues
  the second task instead of spawning it; the first child's `completed`
  result settles its task (`completed queue-1 (main)`) and the freed seat
  pulls `queue-2`, which spawns (`spawned queue-2 -> child-2`).
- S4: THE CHILD'S TERMINAL ARM - an `aborted` result fails its task with the
  settle template `failed queue-1 (main)` and releases the seat.
- S5: THE RESTART RECONCILE - the persisted record (`Snapshot().tasks`) is
  restored in a fresh mount; the task's child is not in the live registry, so
  it is requeued (`requeued queue-1 (main gone)`, `attempts` 1), the seat is
  released and the pull relaunches the SAME spec; a record that was already
  requeued once (`attempts` 1) fails honestly with `failed queue-1 (main)`.
- S6: THE ROUTED SPAWN - a present `dshRoute` resolves the triple and the
  child receives it as `agentOptions` (the dispatched line keeps its
  byte-exact `route <p> <m> <e>` form).
- S7: THE CONTAINED REFUSALS - no live parent and no `subagents` service each
  refuse with the byte-exact `spawn skipped queue-1 (<reason>)` line and
  start nothing.
- S8: INTERRUPT - the task's abort signal fires (the child is canceled
  through the harness's own cancellation channel) and the seat is released.
- S9: A REJECTED START - `spawn failed queue-1 (provider down)` plus the
  honest `failed queue-1 (main)`; the task is not left dispatched.

## Fixtures

The harness is the shared Harness: the real built `Target/Library.js` apply, the real factory instance, the fake ctx, the `Automation` mount, and the `Flush()` join point.

The `Automation` mount holds the enabled plugin, the fake `ctx.subagents` recorder, and the fake `ctx.agents` registry.

The join point uses no sleeps and no timers, because a scenario settles a child by resolving its recorded result.

THE POLICY FIXTURE (D6): the `Automation` mount also opens the OUTER policy gate (`policy.spawn: "auto"`), so these scenarios keep exercising the launch itself.

The gate's `approve` posture and its precedence over `autoSpawn` are the `Policy-Defaults` folder's scenarios.

## Expected ledger strings (byte-exact, `plugin-dsh-queue: ` prefix)

`spawned <id> -> <child>`,
`spawn skipped <id> (no subagents service)`,
`spawn skipped <id> (no live parent)`,
`spawn failed <id> (<error>)`,
`requeued <id> (<agent> gone)`,
`failed <id> (<agent>)`,
plus the unchanged `dispatched <id> -> <agent>[ route <p> <m> <e>]` and
`completed <id> (<agent>)`.

## Expected count

16 PASS.
