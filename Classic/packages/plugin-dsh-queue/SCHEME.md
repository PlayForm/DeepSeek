# SCHEME - @playform/plugin-dsh-queue

The subagent-queue plugin's scheme: the modules, the contracts, the ledger
strings. Plan: `Documentation/Plans/SUBAGENT-QUEUE-PLUGIN.md`.

## 1. The module map

```
Source/
  Library.ts            the entry: name, apply, Config, inject (the loader contract)
  Function/
    Apply.ts            validation, State build, activation proof, service + tools
    Dispatcher.ts       the `dshQueue` service (class form; delegates to the pure cores)
    Enqueue.ts          the enqueue step (the task as data; spec verbatim)
    Dispatch.ts         the assignment step (seat + state flip + routed dispatch)
    Schedule.ts         the deterministic order (deps, then priority, then FIFO)
    Capacity.ts         the seat/release bookkeeping (main 10 / child 2)
    Settle.ts           complete / fail / interrupt (release + journal)
    Board.ts            the batch-state TOC line
    ToolEnqueue.ts      the queue_enqueue tool
    ToolStatus.ts       the queue_status tool
    Validate.ts         the fail-loud composition checks (positive capacities)
  Interface/
    Task.ts             the task schema (id, spec, role, priority, deps, state, ...)
    Route.ts            the self-contained dshRoute sibling shape (probed, never imported)
    Config.ts           the config shape
    State.ts            the State (the factory's shared shape + the queue fields)
    Queue.ts            the `dshQueue` declaration merging on Context
  Variable/
    Config.ts           the Schemastery schema (every knob volatile)
```

## 2. The contracts

- **Loader contract:** `name` = `plugin-dsh-queue` (the four agreeing places:
  the package name, the `name` export, the State build's `module:` option,
  the `logFile` default `~/.dsh/queue.log`); `apply` returns nothing;
  `inject = ["pluginFactory", "tools"]`.
- **The capacity law:** `capacity.main` (10) is the main conversation's pool;
  `capacity.child` (2) caps every spawned agent's own children - the
  two-active regime. The harness knob stays the backstop.
- **The schedule contract:** deterministic - the same store always produces
  the same order; dependencies block (never silently skipped over), priority
  descending, FIFO by seq.
- **The spec law:** the queue never alters a task's spec; the dispatcher only
  schedules.
- **The routing law:** `dshRoute` is probed at dispatch time (the tool-jobs
  precedent), never an injection dependency - the routing enforcer ships
  disabled independently; a missing service is a contained skip.
- **The service contract:** `dshQueue` is registered at apply (constructor
  registration, removed with the owning fiber) and published through
  `Interface/Queue.ts`'s declaration merging.

## 3. The ledger strings (module-owned, byte-stable)

| Event | Line |
| --- | --- |
| Cold mount | `disabled (enabled=false)` |
| Activation | `Activate([...])` → `bundle 0.1.0`, `capacity main=10 child=2`, `routedDispatch true` |
| Enqueue | `queued <id> <role\|auto> p<priority> deps<n>` |
| Dispatch | `dispatched <id> -> <agent>[ route <provider> <model> <effort>]` |
| Running | `running <id>` |
| Settle | `<completed\|failed\|interrupted> <id> (<agent>)` |
| Board | `QUEUE: <n> pending - next: <id\|none> - running: <m>/<limit> (main seats <k>)` |

## 4. The decisions recorded for the end-phase

- The dispatcher is service-driven; the lifecycle hook (a settle event
  triggering the auto-dispatch) waits for the shared pool-semantics probe -
  a wrong hook would silently drop tasks.
- Restart reconciliation: the in-memory store is authoritative in the PoC;
  every flip is journaled, so the end-phase can rebuild the store from the
  journal and reconcile interrupted tasks.
- The IDLE coexistence shares the main pool's seats: an IDLE-held lane
  occupies a reserved slot, the queue fills only the freed remainder.
