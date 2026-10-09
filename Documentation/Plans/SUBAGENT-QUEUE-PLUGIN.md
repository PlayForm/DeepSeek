# SUBAGENT-QUEUE PLUGIN - the task-queue specification (dedicated 2026-10-09)

> The third orchestration-layer plugin (next to BATCH-STATE + ROUTING-ENFORCER).
> The user's mandate: "the subagent QUEUE specification, which allows you to QUEUE
> tasks, not the same as IDLING agents" + "increase the limit so the main
> conversation can launch up to 10 subagents (as IDLE), and dispatch work to them
> later, but have their CHILD subagents limited to 2".

## 0. The problem (the incident the other session hit)

- The harness's active-child cap (maxActiveSubagents - now 1 after the concurrency
  flood fix) blocked the parallel dispatch: the resumed session could run only ONE
  subagent at a time - the "pair" lanes ran back-to-back, and the 8-lane queue
  serialized entirely.
- The IDLE pattern (the paused agents with the specs retained in their contexts)
  holds the agent + the spec in the conversation - context-costly + slot-bound.
- The user's model: the MAIN conversation holds up to 10 subagents (IDLE -
  settled/continuable children - the pool's slots), the CHILD subagents' fan-out
  capped at 2 (the sub-subagents - the workflow flood prevented structurally).
- The harness facts (verified by the other session's inspection of the asar):
  - The pool is PER-ROOT-LINEAGE: `maxActiveSubagents` limits each root
    conversation's shared pool of active children (the main + all descendants
    draw from the same pool).
  - The slots RELEASE when a child settles to IDLE (the continuable children stay
    durable + cold-resume on send_message) - the IDLE children do not consume the
    pool's active slots.
  - The config has ONE knob (maxActiveSubagents) + maxDepth - the patch file loads
    at profile startup (no watcher; the volatile() markers allow the runtime
    settings edits - the UI settings plugin persists elsewhere).
  - The subagent tool's agentOptions carry provider/model/reasoningEffort/maxTokens
    only - no per-child limit knob.

## 1. The concept (the QUEUE vs the IDLE)

| | IDLE (current) | QUEUE (this plugin) |
|---|---|---|
| What holds the task | the agent's context (the spec retained) | the queue STORE (the task as data) |
| The slot cost | one agent per task (the context + the conversation's bookkeeping) | the tasks queued as data; the agents spawned at the dispatch |
| The capacity | the active-child pool (the 10 IDLE-held lanes need 10 slots) | the queue manages the reservations: 10 held + the dispatcher spawns on the freed slots |
| The state | the agent's own session (the progress inside) | the queue's task-state (the spec, the state, the priority, the result) - visible + compiled |
| The resume | the send_message activation | the dispatcher's next-slot assignment |

## 2. The architecture: `@playform/plugin-dsh-queue` (the third family plugin)

### 2.1 The queue store (the task as data)

- The tasks: each with the id, the spec (the full self-contained prompt), the
  role/task-type (for the routing), the priority + the dependencies, the state
  (queued -> dispatched -> running -> completed/failed/interrupted), the
  assigned-agent id, the result hash.
- The store rides the family's journal conventions (the v2 domain, the
  byte-integrity, the tabs) + the batch-state plugin's store (the queue's state
  is part of the batch state).

### 2.2 The dispatcher (the capacity management)

- The user's capacity model: the MAIN conversation holds up to 10 subagents
  (the IDLE-held lanes - the pool's reserved slots); the CHILD subagents'
  fan-out capped at 2 (the per-depth policy: the depth-1 children of any agent
  limited to 2 concurrent).
- The dispatcher's logic:
  ```
  Queue(t) -> the pending tasks (the priority + the dependency order)
  Capacity(main) = 10 - active(main)            # the main's pool
  Capacity(agent) = 2 - active(agent)           # the per-agent child cap
  Dispatch(t): when a slot frees (the main's pool or an agent's child cap), the
               next task is spawned (the routed per the policy) + the task-state
               flips to dispatched/running
  ```
- The RESERVATION model: the orchestrator queues the tasks (the queue holds
  them as data - no agent context consumed); the dispatcher spawns the agents
  when the capacity allows - the "launch up to 10, dispatch later" = the queue
  holds the 10 tasks + the dispatcher assigns them to the freed slots.
- The CHILD-CAP enforcement: every spawned agent's own children limited to 2
  (the plugin's per-depth policy - the workflow fan-out's flood prevented
  structurally - the sub-subagent parallel flood can never recur).

### 2.3 The IDLE integration (the best of both)

- The IDLE-held lanes (the 10-slot reservation) remain supported: the
  dispatcher's reserved slots + the queue's pending tasks coexist - the
  orchestrator chooses per task (the IDLE for the long-lived lanes, the queue
  for the dispatch-later tasks).
- The settled IDLE children release their active slots (the harness fact) - the
  queue's dispatcher assigns the pending tasks to the freed slots automatically.

### 2.4 The integration with the orchestration layer

- The batch-state plugin: the queue's state (the tasks + their states) is part
  of the compiled context block (the TOC's "QUEUE: 4 pending - next: <task>" -
  the pre-baked visibility).
- The routing-enforcer plugin: the queue's dispatch resolves the route per the
  user's policy (the task-type -> the model/effort - silently).
- The pair-schedule: the queue replaces the manual pair bookkeeping - the
  dispatcher's deterministic order (the dependencies + the surfaces' disjointness)
  proposes the next pair; the orchestrator confirms.

## 3. The exploration items

1. The pool semantics' exact surface: the per-root-lineage pool (the other
   session's finding) - the plugin's reservation API: can a plugin reserve the
   main's pool slots + the per-agent child caps programmatically? (the probe: the
   same shared probe as the batch-state + the routing-enforcer).
2. The config's knobs: the maxActiveSubagents (the single knob) vs the plugin's
   own capacity policy - the plugin enforces its model at the dispatch level (the
   harness's knob stays the backstop).
3. The IDLE-vs-queue memory: the queue's store vs the IDLE contexts - the
   measurement (the context-budget comparison) + the user's preference per lane.
4. The child-cap 2: the enforcement point (the spawned agents' own launches - the
   plugin's service consulted at the spawn - or the harness-level knob if the
   probe finds it).
5. The restart semantics: the queue's store survives (the journal); the in-flight
   dispatches resume after the restart (the task-states reconciled).

## 4. The implementation phases

1. The probe (shared with the two sibling plugins): the pool + the reservation
   surface + the per-depth knobs.
2. The queue store (the task schema + the journal).
3. The dispatcher (the capacity model + the deterministic order).
4. The spawn integration (the routed dispatch + the child-cap enforcement).
5. The batch-state integration (the queue's compiled context block).
6. The IDLE coexistence (the reserved slots + the queue's pending).

## 5. The safety + the compatibility

- The user's capacity model is the law (10 held / 2 children) - the plugin
  enforces it; the user's override wins.
- The tasks' specs are the same self-contained prompts (the queue never alters
  them); the dispatcher only schedules.
- The family's plugin discipline (the smokes, the loader contract, the no-commit).
- The fallback: without the plugin, the orchestrator's manual queue (the handoff's
  Tasks/ files + the slot bookkeeping) stays - the plugin automates it.

## 6. The deliverables

- The plugin source + the smokes (the dispatcher's determinism smoke-asserted).
- The queue store + the task schema.
- The capacity model + the child-cap enforcement.
- The batch-state + the routing integrations.
- The probe's findings (the pool + the reservation surface).