# SCHEME - @playform/plugin-dsh-queue

This is the subagent-queue plugin's scheme: the modules, the contracts, and the ledger strings.

Plan: `Documentation/Plans/SUBAGENT-QUEUE-PLUGIN.md`.

## 1. The module map

```
Source/
  Library.ts            the entry: name, apply, Config, inject (the loader contract)
  Function/
    Apply.ts            validation, State build, activation proof, service + tools, the unload effect
    Dispatcher.ts       the `dshQueue` service (class form; delegates to the pure cores)
    Enqueue.ts          the enqueue step (the task as data; spec verbatim)
    Dispatch.ts         the assignment step (seat + state flip + routed dispatch + the spawn)
    Spawn.ts            the LAUNCH through the harness subagent service (+ the child's settlement)
    Schedule.ts         the deterministic order (deps, then priority, then FIFO)
    Capacity.ts         the seat/release bookkeeping (main 10 / child 2)
    Pull.ts             the idle-slot automation (a freed/enqueued seat pulls the next task)
    Settle.ts           complete / fail / interrupt (release + journal)
    Reconcile.ts        the restart reconcile (the persisted record vs the live agents)
    Restore.ts          rebuild the store/seats/id sequence from a persisted queue record
    Board.ts            the batch-state TOC line
    ToolEnqueue.ts      the queue_enqueue tool
    ToolStatus.ts       the queue_status tool
    Validate.ts         the fail-loud composition checks (positive capacities)
  Interface/
    Task.ts             the task schema (id, spec, role, priority, deps, state, childId, attempts, ...)
    Route.ts            the self-contained dshRoute sibling shape (probed, never imported)
    Agent.ts            the self-contained `ctx.agents` shape (currentInitiator / get)
    Subagent.ts         the self-contained `ctx.subagents` shape (startActivation)
    Config.ts           the config shape
    State.ts            the State (the factory's shared shape + the queue fields)
    Queue.ts            the `dshQueue` declaration merging on Context
  Variable/
    Config.ts           the Schemastery schema (every knob volatile)
```

## 2. The contracts

- **Loader contract:** `name` = `plugin-dsh-queue` (the four agreeing places: the package name, the
  `name` export, the State build's `module:` option, the `logFile` default
  `~/.dsh/playform/plugin-dsh-queue.log`); `apply` returns nothing;
  `inject = ["pluginFactory", "tools"]`.
- **The capacity law:** `capacity.main` (10) is the main conversation's pool, and `capacity.child`
  (2) caps every spawned agent's own children, which is the two-active regime. The harness knob
  stays the backstop.
- **The schedule contract:** the order is deterministic, so the same store always produces the same
  order; dependencies block (never silently skipped over), priority descends, and FIFO follows seq.
- **The spec law:** the queue never alters a task's spec, and the dispatcher only schedules. The
  spawn hands the spec to the child as ONE text block, verbatim.
- **The spawn law (the completion re-spec):** the launch goes through the HARNESS subagent service
  (`ctx.subagents.startActivation`, the `spawnProvider` backend), never a private spawn and never a
  shell. The parent is the EXACT live Agent from `ctx.agents.currentInitiator()` (the harness
  identity-compares it); `delivery: "caller"` (the queue owns the task's terminal arm, not the
  model's inbox); the resolved route rides as `agentOptions`.
- **The approval posture:** `autoSpawn` ships **false** (D6: a spawn is a privileged action). False
  means assign and ledger only, with no spawn call and no spawn line. The idle-slot automation is
  gated on `autoDispatch && autoSpawn`, so the manual posture's ledger stays byte-identical to the
  PoC's.
- **The policy block (D6):** the config carries the shared per-action allowlist
  (`policy: Policy()` - read/index/record/suggest/message = `auto`, write/commit/spawn = `approve`),
  mapped to `State.Allow`. It is the **OUTER** gate in front of `autoSpawn` (the **INNER** one): an
  `approve` verdict for `spawn` refuses the launch even with the knob on, logs the byte-exact
  `spawn held <id> (policy spawn=approve)` line, and leaves the task `dispatched` with its seat
  held, so the task waits for the user (flip `policy.spawn` to `auto`, or settle it explicitly). The
  precedence is **policy approve > knob**: the knob can never widen an approve verdict, while a knob
  that is off still refuses on its own and writes no line. The block is one volatile object, so a
  policy flip is hot-editable without a remount, and a resolved pack's `policy` section overrides
  the defaults per action (the wiring is the next refinement).
- **The settlement law:** the child's own result settles its task, as `completed` when the child
  stopped with `completed` and `failed` otherwise; a rejected `startActivation` logs `spawn failed`
  and fails the task (a task whose launch was refused cannot run). A `spawn skipped` (no service, no
  parent) leaves the task dispatched, so the seat is held and the orchestrator decides.
- **The routing law:** `dshRoute` is probed at dispatch time (the tool-jobs precedent), never an
  injection dependency, because the routing enforcer ships disabled independently; a missing service
  is a contained skip.
- **The restart contract:** `Reconcile(persisted?)` restores the caller's `Snapshot().tasks` (the
  family has no storage domain yet), then compares every ACTIVE task with the live agents
  (`ctx.agents.get(childId)`). An orphan is requeued on first detection (`attempts` 0 -> 1) and
  failed on the second, never silently dropped. An in-memory active task with no `childId` is a
  MANUAL assignment and is left alone; a restored one is stale and is reconciled.
- **The service contract:** `dshQueue` is registered at apply (constructor registration, removed
  with the owning fiber) and published through `Interface/Queue.ts`'s declaration merging. The
  surface adds `Reconcile(persisted?)` and `Flush()`, the spawn join point for tests and reconcile
  that never waits for a live child.

## 3. The ledger strings (module-owned, byte-stable)

| Event      | Line                                                                                   |
| ---------- | -------------------------------------------------------------------------------------- |
| Cold mount | `disabled (enabled=false)`                                                             |
| Activation | `Activate([...])` -> `bundle 0.2.1`, `capacity main=10 child=2`, `routedDispatch true` |
| Enqueue    | `queued <id> <role\|auto> p<priority> deps<n>`                                         |
| Dispatch   | `dispatched <id> -> <agent>[ route <provider> <model> <effort>]`                       |
| Running    | `running <id>`                                                                         |
| Settle     | `<completed\|failed\|interrupted> <id> (<agent>)`                                      |
| Board      | `QUEUE: <n> pending - next: <id\|none> - running: <m>/<limit> (main seats <k>)`        |
| Spawned    | `spawned <id> -> <child>`                                                              |
| Spawn hold | `spawn held <id> (policy spawn=approve)`                                               |
| Spawn skip | `spawn skipped <id> (no subagents service)` / `(no live parent)`                       |
| Spawn fail | `spawn failed <id> (<error>)`                                                          |
| Requeue    | `requeued <id> (<agent> gone)`                                                         |
| Reconcile  | `failed <id> (<agent>)` (the settle template, reused)                                  |

The activation line is UNCHANGED (the byte-exact contract), because `autoSpawn` is visible on the
per-task spawn lines, never on the activation proof.

## 4. The decisions recorded for the end-phase

- The dispatcher launches through the harness service and the child's result settles the task, while
  the automation is otherwise fire-and-forget, joined by `Flush()`.
- Restart reconciliation restores the caller's persisted record, because there is no storage domain
  yet and the wave-3 storage migration is the natural home for a durable store. Every flip is
  journaled, so a future rebuild can read the journal instead of the caller's snapshot.
- The IDLE coexistence shares the main pool's seats: an IDLE-held lane occupies a reserved slot, and
  the queue fills only the freed remainder.
- A `spawn skipped` task keeps its seat, because the queue never silently drops an assignment it
  could not launch, and the orchestrator settles it (`Complete` / `Fail` / `Interrupt`).
