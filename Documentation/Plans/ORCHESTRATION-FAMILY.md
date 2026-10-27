---
title: The Orchestration Family - the integrated message bus
category: Plans
kind: queued-plan
date: 2026-10-09
status: implemented (PoC)
registry: Documentation/Plans/ORCHESTRATION-FAMILY.md
index: Documentation/INDEX.md
statuses:
    - name: the integrated message bus (the council hub)
      state: implemented (PoC)
      evidence:
          the orchestration packages under Classic/packages/ (batchstate, route, queue, feedback,
          gitguard, pass-on, ingester, pattern, batch-decision); the PoC-vs-plan grades in
          Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the four members (BATCH-STATE / ROUTING-ENFORCER / SUBAGENT-QUEUE / HONEST-FEEDBACK)
      state: implemented (PoC)
      evidence:
          plugin-dsh-batchstate / plugin-dsh-route / plugin-dsh-queue / plugin-dsh-feedback under
          Classic/packages/; the grades in Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the interim mechanism (the skills)
      state: implemented
      evidence: Documentation/Skill/orchestrator-batch and worker-strains live
---

# THE ORCHESTRATION FAMILY - the integrated message bus (dedicated 2026-10-09)

> The user's mandate: think of the plugin family as an INTEGRATED MESSAGE BUS - disperse the
> information with the blocks + the active communication / programming paradigms already in place,
> looped in a different way - structured
>
> - integrated into the Hermes agent harness. All of these concepts are just FIFO/LIFO queues +
>   parentage combined in different ways + maximal utilization, into dynamic "workflows" - e.g. a
>   conversation. Keep the members' functionality SEPARATE, combine their effectuallity in the
>   eventuallity of the system - when a conversation runs, the members activate invisibly (the
>   user + the orchestrator don't see them) - the COUNCIL HUB is activated, always pertaining
>   knowledge per session. The TRIBE system comes later (conversation + n members + a leader).

## 1. The members (separate in functionality)

| Member           | Plan                       | Function                                                                        | The paradigm it realizes                                         |
| ---------------- | -------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| BATCH-STATE      | BATCH-STATE-PLUGIN.md      | the compiled context (the pre-baked TOC/Scope/Gates - Context = Compile(State)) | the SHARED STATE - the context as a function of the cooperation  |
| ROUTING-ENFORCER | ROUTING-ENFORCER-PLUGIN.md | the silent auto-routing (the user's policy is the law)                          | the POLICY - the configuration as the deterministic input        |
| SUBAGENT-QUEUE   | SUBAGENT-QUEUE-PLUGIN.md   | the task queue + the capacity model (10 held / 2 children)                      | the QUEUES - FIFO/LIFO + the parentage + the dispatch            |
| HONEST-FEEDBACK  | HONEST-FEEDBACK-PLUGIN.md  | the honest signals (the liked/disliked blocks, transferred unread)              | the FEEDBACK - the information flowing the lineage, mechanically |

## 2. The message bus (the combined effectuallity)

- The four members share the primitives: the BLOCKS, which the batch-state compiles, the queue
  dispatches, the routing resolves, and the feedback appends. They share the QUEUES (FIFO and LIFO
  plus the parentage, which give the dispatch order of the tasks and the lineage flow of the
  feedback), and they share the EVENTS of cordis, which carry the state changes, the completions,
  and the signals.
- The members LOOP the paradigms in different ways: the state is a shared block, the tasks are a
  FIFO queue with a priority, the feedback is a LIFO-ish lineage chain where the newest delta comes
  first, and the routing is a pure function. The same primitives in different combinations make the
  dynamic workflows, and a conversation is ONE such workflow where the state is compiled, the tasks
  are dispatched, the routes are resolved, and the signals accumulate, ALL invisibly.
- The eventual system activates the members when a conversation runs, and the user and the
  orchestrator do NOT see them, while the COUNCIL HUB holds the per-session knowledge of the state,
  the queue, the routes, and the feedback.

## 3. The council hub (the per-session knowledge)

- The hub is the unified store of the four members: the batch state with the lanes and the gates,
  the queue with the tasks and their states, the routes with the resolved ledger, and the feedback
  journal with the signals and the deltas. ALL of them are journaled under the family conventions
  and ALL of them are compiled into the context blocks of the batch-state.
- The activation of the hub is invisible, because the services of the members run in the background
  of the harness while the tooling of the orchestrator stays unchanged: the dispatcher of the queue,
  the resolver of the routing, and the collector of the feedback are the own machinery of the
  harness.
- The knowledge of the hub is per session, the state and the signals of that session, and it is the
  raw material for the tribe system.

## 4. The tribe system (the future - recorded, not implemented)

- The conversation is a conversation with n members of it, the members are the councils of the
  conversations, and the tribe is the connected conversations that share the knowledge of the
  cross-session feedback, the state, and the leaders.
- The tribe needs a LEADER, the designated conversation that adjudicates the shared signals and the
  cross-tribe dispatch.
- The direction of the user is "we can then later figure out the tribe system", and the council hub
  is the foundation of per-session knowledge that the tribe builds on.

## 5. The shared probe (the one investigation, three consumers)

The three implementation investigations share the same probe phase:

1. **The inbox and session mechanics.**

    The batch-state's splice and the feedback's transfer use the `agent/inbox/spliced` machinery.

2. **The pool and reservation surface.**

    The capacity of the queue and the launch path of the routing use the per-root-lineage pool and
    the maxActiveSubagents knob.

3. **The config application.**

    The patch load at startup and the volatile settings.

## 6. The family's rules

- The functionality of the members stays SEPARATE, because EACH plugin owns its one concern, while
  the effectuallity is COMBINED through the integrated stores, the compiled context, and the shared
  events.
- The configuration of the user is the law: the routing policy, the capacity model, and the sanctity
  of the honest content.
- The plugin discipline of the family holds: the smokes, the loader contracts, the no-commit rule,
  and the ledger conventions.
- The operation is invisible, because the members NEVER surface to the user or the orchestrator
  unless they are asked, and the council view is the deliberate access.

## 7. The deliverables

- The four member plugins with their plans ready, plus the findings of the shared probe.
- The store integration of the council hub: the state of the batch-state, the queue, the routes, and
  the feedback journal.
- The foundation of the tribe system: the per-session knowledge and the leadership design for a
  future session.

## 8. THE UNDERWRITING EQUATION (the combination space - user-mandated 2026-10-09)

### 8.1 The primitives

- S(t) = the batch State (the lanes, the statuses, the gates - evolving with t)
- Q(t) = the Queue (the tasks as data + their states)
- R(a, t) = the Route (the resolved provider/model/effort per agent)
- F(t) = the Feedback journal (the honest signals + the deltas)
- P = the Parentage (the tree - the lineage)
- H(a, t) = the History (the agent's own conversation blocks - the accumulation)
- U = the User policy (the config - the law)
- A = the Agents

### 8.2 The operators

- Compile(X) - the deterministic generator (the pre-baked block from X)
- Dispatch(Q, S) - the queue's next-task assignment
- Resolve(T, U) - the pure routing function
- Transfer(F, P) - the feedback's lineage flow (the mechanical hop)
- Append(F, D) - the parents' deltas
- Project(C, Scope(a)) - the agent's view of the compiled context
- Loop(...) - the closed cycle (state -> compile -> inject -> act -> report -> ...)

### 8.3 THE EQUATION (the context underwritten)

```
Context(a, t) = Compile( S(t) ⊕ Q(t) ⊕ R(a, t) ⊕ F(t) ⊕ P ⊕ Scope(a) ) + H(a, t)
Council(t)   = { S(t), Q(t), R(·, t), F(t) }     <- the per-session knowledge
Family(t)    = Loop( Activate, Compile, Inject, Act, Report, Append, Recompile )
```

- The + is the accumulation of the history, the own blocks of the conversation.
- The ⊕ is the block composition: the compiled members, ordered, bounded, and pre-baked.
- The instances of the equation: the conversation is Family(t) and the council is its state, while
  the tribe is the composition of the councils as Tribe(t) = Σ Council_i(t) with a Leader.

### 8.4 THE COMBINATION SPACE (all the ways the members combine)

| #   | The combination  | The flow                                                                                | The effect                     |
| --- | ---------------- | --------------------------------------------------------------------------------------- | ------------------------------ |
| 1   | S -> Q           | the state changes drive the dispatch (a lane completes -> the queue's next)             | the gate-driven queue          |
| 2   | S -> C           | the state compiled into the context blocks                                              | the dynamic TOC                |
| 3   | Q -> S           | the tasks' states are the batch state                                                   | the queue as a state dimension |
| 4   | Q -> R           | the dispatched tasks carry their routes                                                 | the routed dispatch            |
| 5   | R -> C           | the routes compiled into the context (the gates)                                        | the routing truth              |
| 6   | F -> S           | the signals feed the state (the friction notes)                                         | the council's observations     |
| 7   | F -> R           | the disliked routing feeds the policy review                                            | the config's feedback loop     |
| 8   | S -> F           | the parents' deltas appended (the state observations)                                   | the lineage deltas             |
| 9   | Q -> F           | the completions attach their feedback footers                                           | the honest reports             |
| 10  | P -> all         | the parentage composes EVERY member (the parents see the children's compiled summaries) | the tree's inheritance         |
| 11  | Scope -> C       | the projection (EACH agent sees the council filtered by its role)                       | the per-agent pre-baked view   |
| 12  | t -> all         | the recompilation on EVERY state change                                                 | the constant-state-slot        |
| 13  | Loop             | the closed cycles (Family, the dispatch loop, the feedback loop)                        | the dynamic workflows          |
| 14  | Council -> Tribe | the councils composed + a leader                                                        | the future tribe system        |

- EVERY combination is the same primitives looped differently, which is the message bus of the
  family. The Compile operator composes the blocks, the queues of FIFO and LIFO plus the parentage
  provide the ordering, the events provide the triggers, and the maximal utilization is the
  cross-feeding of the 14 rows.

## 9. THE SPHERE COMPACTION (the layered visualization - user-mandated 2026-10-09)

The context blocks are the MIDDLE LAYER of a nested sphere. The tool calls OVERWRITE them (the outer
surface). The behaviors UNDERWRITE them (the inner generators). The whole is sphere compaction - the
layers feed inward, the volume is held (the state replaced, the blocks bounded).

```
        ┌───────────────────────────────────────────────┐
        │  THE TOOL CALLS - the OVERWRITE (the outer    │
        │  surface): write/edit/send/dispatch - every   │
        │  action replaces the stale block as it lands  │
        │  (the state change -> the recompile trigger)  │
        ├───────────────────────────────────────────────┤
        │  THE CONTEXT BLOCKS - the MIDDLE LAYER: the   │
        │  compiled council view (S + Q + R + F + Scope)│
        │  - the pre-baked TOC/Scope/Gates/feedback -   │
        │  read by the agents - the constant-state-slot │
        │  (replaced in place, never accumulated)       │
        ├───────────────────────────────────────────────┤
        │  THE BEHAVIORS - the UNDERWRITE (the inner    │
        │  generators): the plugin funcs (Compile,      │
        │  Dispatch, Resolve, Transfer, Append) + the   │
        │  user's policy - the foundations that back    │
        │  and generate the middle layer                │
        ├───────────────────────────────────────────────┤
        │  THE CORE - the equation itself:              │
        │  Context(a,t) = Compile(S+Q+R+F+Scope) + H    │
        └───────────────────────────────────────────────┘
           THE COMPACTION: every layer feeds the inner
           one - the tool calls compact into the state,
           the state compacts into the blocks, the
           blocks compact into the agents' reads - the
           sphere holds its volume (the replaced blocks,
           the bounded history, the budgeted context).
```

- The OVERWRITE semantics: the effect of a tool call lands on the surface of the sphere, the
  state-change event fires, the Compile re-generates the middle layer, and the stale block is
  REPLACED because the tool call overwrites the block and the outer action of the sphere compacts
  into the inner state.
- The UNDERWRITE semantics: the behaviors are the foundation of the sphere, the policies and the
  functions guarantee the content of the blocks, and the underwriting means that the deterministic
  generators back the middle layer, so the blocks are the compiled outputs of the policies.
- The sphere compaction keeps the volume CONSTANT-ish: the state slot is replaced and NEVER grown,
  the blocks are bounded by the context budgets, and the accumulation of the history is the ONLY
  growth (+H, itself budgeted). The maximal utilization of the family is the same sphere with the 14
  combinations looping inside it.

## 10. THE SUB-BLOCKS + THE PERMISSIONS (user-mandated 2026-10-09)

The middle-layer context blocks are NOT monolithic, because they are COMPOSED OF SUB-BLOCKS, and
EACH sub-block has a PERMISSION level per tool, per model family, and per plugin functionality or
behavior.

The Compile operator becomes permission-aware:

```
Context(a, t) = Compile( Council(t) ⊙ Scope(a) ⊙ Perm(a) ) + H(a, t)

Perm(a) = f( tool(a), modelFamily(a), role(a), pluginBehavior(a) )
```

- The ⊙ is the SCOPE and PERMISSION projection, where the agent sees ONLY the sub-blocks that its
  permissions admit. The pre-baked block is filtered at compile time and NEVER at read time, because
  the permission is the input of the compiler and NOT the gate of the agent.

### 10.1 The sub-block catalog (the compiled block's internal structure)

| Sub-block | Content                                                   | The permission dimensions                                                                                                                                                                |
| --------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TOC       | the batch state (the lanes, the statuses, the queue view) | ALL agents (the universal baseline)                                                                                                                                                      |
| Scope     | the agent's surfaces + the off-limits                     | role-bound (the coder sees the code surfaces, the explorer the read surfaces)                                                                                                            |
| Gates     | the arbiter truth (the build/smokes states)               | tool-bound (the execution lanes see the gates, the explorers the summary) + model-family (the planner sees the full gate ledger, the GLM lanes the compact)                              |
| Routing   | the resolved routes + the policy facts                    | model-family-bound (the planner's lane sees the routing truth for the review; the coder's lane sees ONLY its own route) - the routing-enforcer's ledger is the planner/council sub-block |
| Queue     | the tasks + the states + the next dispatch                | parent-bound (the orchestrator's view: the full queue; the agents' view: their own task ONLY)                                                                                            |
| Feedback  | the honest signals + the deltas                           | READ-PERMISSION-bound (the know/disknow - the recipient's opt-in - the sub-block excluded until the read-permission is granted; the transfer NEVER force-reads)                          |
| Policy    | the user's config facts                                   | plugin-behavior-bound (the routing-enforcer + the queue consult it; the agents NEVER see it - the "you don't have to know" doctrine)                                                     |

### 10.2 The permission matrix (the alignment)

- PER TOOL: the visibility of a sub-block follows the tooling. For example, the Gates sub-block
  gives its full detail to the lanes that run the build, the internal state of the queue is visible
  ONLY through the surface of the dispatcher, the lanes of the write tool see the ownership matrix
  of the file-level detail of the Scope sub-block, and the read-only lanes see the summary.
- PER MODEL FAMILY: the detail level of the sub-blocks differs with the family of the routing. The
  DeepSeek planner lane receives the FULL compiled view with the depth of the council (the routes,
  the ledger of the gates, and the feedback summary) because its planning needs the whole sphere,
  while the GLM coder and explorer lanes receive the COMPACT pre-baked sub-blocks of their scope,
  the summary of the gates, and their own route, which is the minimal surface that their behavior
  requires. The model family is the permission dimension, the routing-enforcer resolves the family,
  and the Compile applies its detail level.
- PER PLUGIN BEHAVIOR: the functionality of EACH member owns the permissions of its sub-block: the
  read-permission of the feedback (the know or disknow), the policy-hiding of the routing where the
  agents NEVER see the config under the "you don't have to know" doctrine, and the parent-bound
  visibility of the queue.

### 10.3 The sphere's alignment (the compaction + the permissions)

- The middle layer of the sphere is the permissioned sub-blocks, and the Compile outputs the
  filtered composition because Perm(a) is the input of the compiler. The baked block arrives ALREADY
  filtered, so the agent reads exactly what its permissions admit and NOTHING more, and the "read
  mechanically" doctrine extends to the sub-block level.
- The compaction with the permissions bounds the volume of the sub-blocks per permission class,
  because the planner gets the full view and the coder the compact view, so the per-agent volume of
  the sphere varies with the permission while the budgets hold the total.
- The events of the sub-blocks work so that a permission change (the read-permission granted or the
  model family switched) recompiles the affected sub-blocks, and the surface of the sphere updates
  in place.

### 10.4 The examples (the system's behavior)

- The FEEDBACK sub-block is excluded from EVERY compiled block of an agent by default, because the
  read-permission is off. The deliberate grant of the recipient compiles it in (the know), and
  otherwise it transfers mechanically unread (the disknow), so the honest signals NEVER surface
  uninvited.
- The ROUTING sub-block gives the planner's compiled view the routing ledger as the review material
  of the council, and the coder's view carries ONLY its own resolved route under the model-family
  permission.
- The POLICY sub-block is NEVER compiled into ANY block of an agent. The behaviors of the plugin
  functions consult it internally, and the agents act on the compiled outputs WITHOUT ever seeing
  the configuration, which is the responsibility of the user and the silence of the system.
