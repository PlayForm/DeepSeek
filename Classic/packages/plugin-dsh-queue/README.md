# @playform/plugin-dsh-queue

The subagent-queue plugin: subagent work becomes a **queue** - the tasks as
data, not the agents as contexts. The third orchestration-layer plugin, next
to the batch-state and routing-enforcer plugins.

Plan: `Documentation/Plans/SUBAGENT-QUEUE-PLUGIN.md`.

## The model

| | IDLE (the harness's own) | QUEUE (this plugin) |
| --- | --- | --- |
| What holds the task | the agent's context | the queue store (data) |
| The slot cost | one agent per task | data only; agents spawn at dispatch |
| The resume | send_message activation | the dispatcher's next-slot assignment |

The user's capacity model is the law:

- **Main pool: 10.** The main conversation holds up to 10 subagents
  (reserved slots, IDLE-held lanes included).
- **Child cap: 2.** Every spawned agent's own child fan-out is capped at 2 -
  the two-active regime; the workflow fan-out flood is prevented
  structurally.
- The harness's own `maxActiveSubagents` knob stays the backstop; the plugin
  enforces its model at the dispatch level.

## What it does

- **Enqueue** (`queue_enqueue` tool or `dshQueue.Enqueue`): a task carries the
  id, the self-contained spec (never altered), the role for the routing, the
  priority, the dependencies, the state and the result hash. No agent context
  is consumed while it waits.
- **Dispatch** (`dshQueue.Dispatch`): the deterministic order - dependencies
  satisfied first, then priority descending, then FIFO by enqueue sequence;
  a seat is taken from the agent's pool, the state flips to `dispatched`.
- **Routed dispatch:** when the routing enforcer (`dshRoute`) is present, the
  route is resolved per the user's policy, silently; absent, the dispatch
  proceeds unrouted (a contained skip).
- **Settle** (`Complete` / `Fail` / `Interrupt`): the seat is released, the
  journal records the flip; the auto-dispatch regime fills the freed slot on
  the next `Dispatch` call.
- **The board:** the queue's state compiles into the batch-state context
  block as one TOC line: `QUEUE: <n> pending - next: <id|none> - running:
  <m>/<limit>`.
- **The journal:** every state flip writes a best-effort P5 journal record
  plus one byte-stable ledger line - the restart reconciliation's raw data.

## The service

The plugin registers the `dshQueue` service:

| Method | Meaning |
| --- | --- |
| `Enqueue(input)` | Queue a task (spec verbatim). |
| `Dispatch(agent?)` | The deterministic next assignment (main pool by default). |
| `Capacity(agent?)` | The free slots for the main pool or an agent. |
| `Start(id)` / `Complete(id, hash?)` / `Fail(id)` / `Interrupt(id)` | The state machine (settle releases the seat). |
| `Board()` / `Snapshot()` | The compiled line / the full queue record. |

## Configuration (all volatile)

| Field | Default | Meaning |
| --- | --- | --- |
| `enabled` | `false` | Master switch (ships disabled). |
| `log` / `logFile` | `true` / `~/.dsh/queue.log` | The plugin's own ledger. |
| `capacity.main` / `capacity.child` | 10 / 2 | The user's capacity model. |
| `autoDispatch` | `true` | Freed slots trigger the next assignment. |
| `routedDispatch` | `true` | Consult `dshRoute` at dispatch when present. |

## Status

PoC: the source is complete; the build, the smoke suite and the live wiring
are the end-phase (`Documentation/Plans/POC-BRIEF.md` section 8). The
reservation API's exact surface against the harness's per-root-lineage pool
is the shared probe's open item; the dispatcher is service-driven until it
lands.
