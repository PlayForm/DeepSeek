---
title: The Subagent-Queue Plugin - the task-queue specification
category: Plans
kind: queued-plan
date: 2026-10-09
status: implemented (PoC)
registry: Documentation/Plans/SUBAGENT-QUEUE-PLUGIN.md
index: Documentation/INDEX.md
statuses:
    - name: the subagent-queue plugin (the task queue)
      state: implemented (PoC)
      evidence:
          plugin-dsh-queue under Classic/packages/ (with its ets-plugin-dsh-queue twin); the
          PoC-vs-plan grades in Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the capacity model (10 held / 2 children)
      state: implemented (PoC)
      evidence:
          the queue's capacity model in plugin-dsh-queue; the grades in
          Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the pool and reservation surface (the probe)
      state: implemented (PoC)
      evidence:
          the seat/release and dispatch in plugin-dsh-queue; the grades in
          Documentation/Reports/POC-GAP-ANALYSIS.md
---

# SUBAGENT-QUEUE PLUGIN - the task-queue specification (dedicated 2026-10-09)

> The third plugin of the orchestration layer, next to BATCH-STATE and ROUTING-ENFORCER. The mandate
> of the user: "the subagent QUEUE specification, which allows you to QUEUE tasks, not the same as
> IDLING agents" plus "increase the limit so the main conversation can launch up to 10 subagents (as
> IDLE), and dispatch work to them later, but have their CHILD subagents limited to 2".

## 0. The problem (the incident the other session hit)

- The active-child cap of the harness (`maxActiveSubagents`, which is now 1 after the concurrency
  flood fix) blocked the parallel dispatch, so the resumed session could run ONLY ONE subagent at a
  time, the "pair" lanes ran back-to-back, and the 8-lane queue serialized entirely.
- The IDLE pattern of the paused agents with the specs retained in their contexts holds the agent and
  the spec in the conversation, which is context-costly and slot-bound.
- The model of the user is that the MAIN conversation holds up to 10 subagents as IDLE
  settled-or-continuable children in the slots of the pool, while the fan-out of the CHILD subagents
  is capped at 2, so the workflow flood is prevented structurally.
- The harness facts, verified by the inspection of the asar in the other session:
    - The pool is PER-ROOT-LINEAGE, because `maxActiveSubagents` limits the shared pool of active
      children of EACH root conversation, and the main and ALL descendants draw from the same pool.
    - The slots RELEASE when a child settles to IDLE, because the continuable children stay durable
      and cold-resume on send_message, and the IDLE children do NOT consume the active slots of the
      pool.
    - The config has ONE knob (`maxActiveSubagents`) plus maxDepth, and the patch file loads at
      profile startup with no watcher while the volatile() markers allow the runtime settings edits
      that the UI settings plugin persists elsewhere.
    - The agentOptions of the subagent tool carry provider, model, reasoningEffort, and maxTokens
      ONLY, with NO per-child limit knob.

## 1. The concept (the QUEUE vs the IDLE)

|                     | IDLE (current)                                                    | QUEUE (this plugin)                                                                         |
| ------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| What holds the task | the agent's context (the spec retained)                           | the queue STORE (the task as data)                                                          |
| The slot cost       | ONE agent per task (the context + the conversation's bookkeeping) | the tasks queued as data. The agents spawned at the dispatch                                |
| The capacity        | the active-child pool (the 10 IDLE-held lanes need 10 slots)      | the queue manages the reservations: 10 held + the dispatcher spawns on the freed slots      |
| The state           | the agent's own session (the progress inside)                     | the queue's task-state (the spec, the state, the priority, the result) - visible + compiled |
| The resume          | the send_message activation                                       | the dispatcher's next-slot assignment                                                       |

## 2. The architecture: `@playform/plugin-dsh-queue` (the third family plugin)

### 2.1 The queue store (the task as data)

- EACH task carries the id, the spec as the full self-contained prompt, the role or task type for the
  routing, the priority and the dependencies, the state from queued to dispatched, running, and
  completed, failed, or interrupted, the assigned-agent id, and the result hash.
- The store rides the journal conventions of the family with the v2 domain, the byte integrity, and
  the tabs, plus the store of the batch-state plugin, because the state of the queue is part of the
  batch state.

### 2.2 The dispatcher (the capacity management)

- The capacity model of the user holds up to 10 subagents in the MAIN conversation as IDLE-held lanes
  in the reserved slots of the pool, and the fan-out of the CHILD subagents is capped at 2 under the
  per-depth policy that limits the depth-1 children of ANY agent to 2 concurrent.
- The logic of the dispatcher:
    ```
    Queue(t) -> the pending tasks (the priority + the dependency order)
    Capacity(main) = 10 - active(main)            # the main's pool
    Capacity(agent) = 2 - active(agent)           # the per-agent child cap
    Dispatch(t): when a slot frees (the main's pool or an agent's child cap), the
                 next task is spawned (the routed per the policy) + the task-state
                 flips to dispatched/running
    ```
- The RESERVATION model queues the tasks as data with NO agent context consumed, and the dispatcher
  spawns the agents when the capacity allows, so "launch up to 10, dispatch later" means that the
  queue holds the 10 tasks and the dispatcher assigns them to the freed slots.
- The CHILD-CAP enforcement limits the own children of EVERY spawned agent to 2 under the per-depth
  policy of the plugin, so the flood of the workflow fan-out is prevented structurally and the
  parallel flood of sub-subagents can NEVER recur.

### 2.3 The IDLE integration (the best of both)

- The IDLE-held lanes of the 10-slot reservation remain supported, and the reserved slots of the
  dispatcher and the pending tasks of the queue coexist, so the orchestrator chooses per task between
  the IDLE for the long-lived lanes and the queue for the dispatch-later tasks.
- The settled IDLE children release their active slots under the harness fact, and the dispatcher of
  the queue assigns the pending tasks to the freed slots automatically.

### 2.4 The integration with the orchestration layer

- The batch-state plugin carries the state of the queue with the tasks and their states in the
  compiled context block, such as the TOC line "QUEUE: 4 pending - next: <task>", which is the
  pre-baked visibility.
- The routing-enforcer plugin resolves the route of a dispatch per the policy of the user from the
  task type to the model and effort, silently.
- The pair schedule replaces the manual pair bookkeeping, because the deterministic order of the
  dispatcher over the dependencies and the disjointness of the surfaces proposes the next pair and
  the orchestrator confirms it.

## 3. The exploration items

1. **The pool semantics.**

    The exact surface is the per-root-lineage pool that the other session found, and the open question is whether a plugin can reserve the pool slots of the main and the per-agent child caps programmatically. The probe is the same shared probe as the batch-state and the routing-enforcer.

2. **The config knobs.**

    The question is `maxActiveSubagents` as the single knob against the own capacity policy of the plugin, where the plugin enforces its model at the dispatch level and the knob of the harness stays the backstop.

3. **The IDLE against the queue memory.**

    The comparison is the store of the queue against the IDLE contexts, measured by the context-budget comparison and the preference of the user per lane.

4. **The child cap of 2.**

    The enforcement point is either the own launches of the spawned agents through the service of the plugin at the spawn, or the harness-level knob when the probe finds one.

5. **The restart semantics.**

    The store of the queue survives through the journal, and the in-flight dispatches resume after the restart with the task states reconciled.

## 4. The implementation phases

1. **The probe.**

    The probe is shared with the two sibling plugins and covers the pool, the reservation surface, and the per-depth knobs.

2. **The queue store.**

    The task schema and the journal.

3. **The dispatcher.**

    The capacity model and the deterministic order.

4. **The spawn integration.**

    The routed dispatch and the child-cap enforcement.

5. **The batch-state integration.**

    The compiled context block of the queue.

6. **The IDLE coexistence.**

    The reserved slots and the pending tasks of the queue.

## 5. The safety and the compatibility

- The capacity model of the user is the law of 10 held and 2 children, and the plugin enforces it
  while the override of the user wins.
- The specs of the tasks are the same self-contained prompts and the queue NEVER alters them, because
  the dispatcher ONLY schedules.
- The plugin discipline of the family holds: the smokes, the loader contract, and the no-commit rule.
- The fallback: WITHOUT the plugin, the manual queue of the orchestrator with the handoff's Tasks/
  files and the slot bookkeeping stays, and the plugin automates it.

## 6. The deliverables

- The source of the plugin and the smokes, where the determinism of the dispatcher is smoke-asserted.
- The queue store and the task schema.
- The capacity model and the child-cap enforcement.
- The batch-state and routing integrations.
- The findings of the probe on the pool and the reservation surface.
