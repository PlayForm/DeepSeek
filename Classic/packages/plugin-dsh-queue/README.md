# @playform/plugin-dsh-queue

> v0.3.0 - UNPUBLISHED - plan:
> [SUBAGENT-QUEUE-PLUGIN](../../Documentation/Plans/SUBAGENT-QUEUE-PLUGIN.md)

## The role

The subagent-queue plugin turns subagent work into a **queue**: the tasks become data, not the
agents as contexts.

It is the third orchestration-layer plugin, beside the batch-state and routing-enforcer plugins.

Plan: `Documentation/Plans/SUBAGENT-QUEUE-PLUGIN.md`.

## The surfaces

- The `queue_enqueue` tool and the `dshQueue` service (the method table below).
- The subagent launch through the harness's own subagent service (`ctx.subagents.startActivation`)
  when `autoSpawn` is on.
- The batch-state context block projection (the TOC line).

## The model

|                     | IDLE (the harness's own) | QUEUE (this plugin)                   |
| ------------------- | ------------------------ | ------------------------------------- |
| What holds the task | the agent's context      | the queue store (data)                |
| The slot cost       | one agent per task       | data only; agents spawn at dispatch   |
| The resume          | send_message activation  | the dispatcher's next-slot assignment |

The user's capacity model is the law:

- **Main pool: 10.**

    The main conversation holds up to 10 subagents (reserved slots, IDLE-held lanes included).

- **Child cap: 2.**

    Every spawned agent's own child fan-out is capped at 2, which is the two-active regime, and the
    workflow fan-out flood is prevented structurally.

- The harness's own `maxActiveSubagents` knob stays the backstop, and the plugin enforces its model
  at the dispatch level.

## What it does

- **Enqueue** (`queue_enqueue` tool or `dshQueue.Enqueue`): a task carries the id, the
  self-contained spec (never altered), the role for the routing, the priority, the dependencies, the
  state, and the result hash.

    No agent context is consumed while it waits.

- **Dispatch** (`dshQueue.Dispatch`): the order is deterministic - dependencies satisfied first,
  then priority descending, then FIFO by enqueue sequence; a seat is taken from the agent's pool,
  and the state flips to `dispatched`.

- **Spawn** (`autoSpawn`, off by default): an assignment actually **starts a subagent through the
  harness's own subagent service** (`ctx.subagents.startActivation`), never a private spawn and
  never a shell.

    The spec goes to the child verbatim, and the resolved route goes as its `agentOptions`.

    The parent is the exact live Agent from `ctx.agents.currentInitiator()`, and the child's own
    result settles the task (`completed`, or `failed` for any other stop reason).

- **Idle-slot automation:** with `autoDispatch` and `autoSpawn` both on, an enqueue or a released
  seat pulls the next queued task into the free slot, so the queue runs itself.
- **Routed dispatch:** when the routing enforcer (`dshRoute`) is present, the route is resolved per
  the user's policy, silently; absent, the dispatch proceeds unrouted (a contained skip).
- **Settle** (`Complete` / `Fail` / `Interrupt`): the seat is released and the journal records the
  flip; `Interrupt` also fires the spawn's own abort signal, canceling the child.
- **Restart reconcile** (`dshQueue.Reconcile(persisted?)`): the caller hands back the previous
  process's `Snapshot().tasks`, and every active task whose agent is not live is **requeued** once
  (`attempts` 0 -> 1) and **failed honestly** on the second detection, never silently dropped.
- **The board:** the queue's state compiles into the batch-state context block as one TOC line:
  `QUEUE: <n> pending - next: <id|none> - running: <m>/<limit>`.
- **The journal:** every state flip writes a best-effort P5 journal record plus one byte-stable
  ledger line, which is the restart reconciliation's raw data.

## The service

The plugin registers the `dshQueue` service:

| Method                                                             | Meaning                                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `Enqueue(input)`                                                   | Queue a task (spec verbatim).                                       |
| `Dispatch(agent?)`                                                 | The deterministic next assignment (main pool by default).           |
| `Capacity(agent?)`                                                 | The free slots for the main pool or an agent.                       |
| `Start(id)` / `Complete(id, hash?)` / `Fail(id)` / `Interrupt(id)` | The state machine (settle releases the seat).                       |
| `Reconcile(persisted?)`                                            | The restart reconcile; the report of requeued/failed ids.           |
| `Flush()`                                                          | Join the in-flight spawns (tests/reconcile; never a hot-path wait). |
| `Board()` / `Snapshot()`                                           | The compiled line / the full queue record.                          |

## The configuration (all volatile)

| Field                              | Default                                         | Meaning                                                            |
| ---------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| `enabled`                          | `false`                                         | Master switch (ships disabled).                                    |
| `log` / `logFile`                  | `true` / `~/.dsh/playform/plugin-dsh-queue.log` | The plugin's own ledger.                                           |
| `capacity.main` / `capacity.child` | 10 / 2                                          | The user's capacity model.                                         |
| `autoDispatch`                     | `true`                                          | Freed slots trigger the next assignment.                           |
| `routedDispatch`                   | `true`                                          | Consult `dshRoute` at dispatch when present.                       |
| `autoSpawn`                        | `false`                                         | **Actually start the subagent** (the approval posture; see below). |
| `spawnProvider`                    | `spawn`                                         | The harness subagent backend name selected at spawn.               |
| `policy.*`                         | see below                                       | The D6 per-action allowlist (the OUTER gate).                      |

### `autoSpawn` (the approval posture)

`autoSpawn` is the switch between **assigning** and **launching**.

It ships `false` on purpose, because a spawn is a privileged action (D6 of the completion spec), so
the queue assigns seats and ledgers until the user turns the launch on.

With `autoSpawn: false` there is no `ctx.subagents` call and no spawn ledger line.

The idle-slot automation is off too, because an automatic assignment the plugin cannot launch would
strand the task with a held seat.

With `autoSpawn: true` the dispatcher launches, the child's result settles the task, and a released
seat pulls the next queued task.

### The policy block (D6) - the outer gate

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The policy is the **outer** gate, and `autoSpawn` is the **inner** one.

An `approve` verdict for `spawn` refuses the launch even with the knob on: the task stays
`dispatched` with its seat held, and the ledger records the byte-exact
`spawn held <id> (policy spawn=approve)` line.

The task then **waits** for the user, who flips `policy.spawn` to `auto` to let the next assignment
launch, or settles it explicitly with `Complete`/`Fail`/`Interrupt`.

The precedence is **policy approve > knob**: the knob can never widen an approve verdict, while a
knob that is off still refuses on its own and writes no line at all.

The block is one volatile object, so a policy flip is hot-editable without a remount, and a resolved
pack's `policy` section overrides the defaults per action (the wiring is the next refinement).

The ledger lines of the spawn (documented in `SCHEME.md` section 3): `spawned <id> -> <child>`,
`spawn held <id> (policy spawn=approve)`, `spawn skipped <id> (<reason>)`,
`spawn failed <id> (<error>)`, `requeued <id> (<agent> gone)`.

## The ledger

The journal lines (documented in `SCHEME.md` section 3, byte-stable):

```text
spawned <id> -> <child>
spawn held <id> (policy spawn=approve)
spawn skipped <id> (<reason>)
spawn failed <id> (<error>)
requeued <id> (<agent> gone)
```

Every state flip also writes a best-effort P5 journal record, which is the restart reconciliation's
raw data.

## The build and the tests

The build is `pnpm prepublishOnly` (Source/prepublishOnly.sh): the plugin build (ESM `Target/`, Test
tree excluded), the Test build, the harness selfcheck, and the Test type-check.

The smoke folders are `Dispatch-And-Board`, `Policy-Defaults`, `Spawn-And-Reconcile`, and
`Wiring-And-Queue`.

## The plan

The spawn, the idle-slot automation, and the restart reconcile are implemented and smoke-arbitrated
(`Source/Test/Spawn-And-Reconcile`).

The policy gate and its precedence are arbitrated by `Source/Test/Policy-Defaults`.

The durable queue store is the remaining piece: the reconcile takes the caller's persisted record
because the family has no storage domain yet, and the wave-3 storage migration is its home.

A `spawn skipped` task keeps its seat until the orchestrator settles it, which is an honest gap,
never a silent drop.

- [SUBAGENT-QUEUE-PLUGIN](../../Documentation/Plans/SUBAGENT-QUEUE-PLUGIN.md) - the queue model.

## License

CC0-1.0.
