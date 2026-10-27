---
title: The Honest-Feedback Plugin - the fourth orchestration member
category: Plans
kind: queued-plan
date: 2026-10-09
status: implemented (PoC)
registry: Documentation/Plans/HONEST-FEEDBACK-PLUGIN.md
index: Documentation/INDEX.md
statuses:
    - name: the honest-feedback plugin (the fourth member)
      state: implemented (PoC)
      evidence:
          plugin-dsh-feedback under Classic/packages/ (with its ets-plugin-dsh-feedback twin); the
          PoC-vs-plan grades in Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the transferred-unread feedback block
      state: implemented (PoC)
      evidence:
          the intake/classify/summary pipeline in plugin-dsh-feedback; the grades in
          Documentation/Reports/POC-GAP-ANALYSIS.md
---

# HONEST-FEEDBACK PLUGIN - the fourth orchestration member (dedicated 2026-10-09)

> The mandate of the user: "an HONEST feedback footer, which inserts a dynamic HONEST feedback block
> which can be transferred (without being read) - it's always modified in parent sessions, to know /
> disknow what the sub agents liked / disliked". The plugin family is an INTEGRATED MESSAGE BUS,
> where the information disperses with the blocks and with the communication and programming
> paradigms that are already in place (FIFO and LIFO queues, parentage combined in different ways,
> and maximal utilization into dynamic workflows as a conversation).

## 0. The concept (the honest signals)

- EVERY completion of an agent carries an HONEST feedback block, and the block records what the
  agent LIKED and DISLIKED: the friction points, the spec ambiguities, the environment issues (the
  concurrent lanes, the broken states, and the tooling), the routing, and the coordination. These
  are the genuine signals of the agent, free of the politeness of the report.
- The block is TRANSFERRED THROUGH THE PARENTAGE mechanically from child to parent to grandparent
  sessions. The block is ALWAYS modified in the parent sessions, where the parents append their own
  observations and the deltas, and the block flows UP WITHOUT being READ by the passers because the
  transfer is mechanical. The reading is the CHOICE of the recipient, "to know / disknow", and the
  recipient decides when to read it while the transfer NEVER forces the reading.
- The signals accumulate per session as the council knowledge, and they are the raw material for the
  future TRIBE system of a conversation with n members and a leader.

## 1. The block format (the dynamic footer)

```
[HONEST FEEDBACK - <agent id> - <task> - <session>]
LIKED: <the agent's genuine likes - the spec, the environment, the tools>
DISLIKED: <the frictions - the ambiguities, the broken states, the concurrency>
DELTAS: <the parent sessions' appends - the observations the passers added>
TRANSFERRED: <the path: child -> parent -> ... - the mechanical chain>
READ-STATUS: unread / read-at <session>   <- the recipient's choice, recorded
```

- The block is appended to the completion report of the agent as the footer, and it is written to
  the feedback journal under the family's conventions of the v2 domain.
- The transfer of the block works through the DELTAS of the parent sessions, which append their own
  observations such as "this lane's friction matches the earlier lane's". The block is ALWAYS
  modified as it passes, and it is NEVER sanitized and NEVER filtered, so the honest content
  survives the chain.

## 2. The architecture: `@playform/plugin-dsh-feedback` (the fourth family member)

### 2.1 The feedback journal (the council knowledge)

- The journal is the per-session feedback log under the journal conventions of the family, where
  EVERY block of an agent is appended at its completion, the deltas of the parent sessions are
  appended, and the read-statuses are recorded.
- The journal is part of the store of the batch-state plugin, because the council knowledge is a
  first-class state dimension, and the context of the compiler can surface the signals pre-baked
  when the recipient opts in.

### 2.2 The transfer service (the mechanical chain)

- `feedback/push(block, path)` performs the transfer of the block through the parentage: the block
  of the child is pushed to the session log of its parent, the parent appends its deltas and pushes
  onward, and the transfer is a mechanical FIFO through the lineage where the parentage is the queue
  and the feedback flows up the tree with ONE hop per session boundary.
- `feedback/read(agentId, session)` is the OPTIONAL read of the recipient, the know or disknow
  choice, and the block is NEVER force-read while the read-status is recorded when the recipient
  opens it.
- `feedback/summary(session)` is the council view of the aggregate signals of the session (the liked
  and disliked clusters), and it exists for the deliberate review of the recipient.

### 2.3 The integration with the orchestration layer

- The batch-state plugin carries the state of the feedback journal (the count of the blocks, the
  unread signals, and the latest deltas) in the compiled context, which is the visibility of the
  council hub per session.
- The subagent-queue plugin emits the feedback blocks on task completion, and the dispatcher of the
  queue attaches the block to the completion report.
- The routing-enforcer feeds the DISLIKED signals about the routing into the ledger, which holds the
  "the routing felt wrong" observations as the review material of the config.

## 3. The council hub (the eventual system)

- When a conversation runs, the orchestration members activate INVISIBLY, because the user and the
  orchestrator do NOT see them while the plugins work in the background. The batch-state compiles
  the context, the queue dispatches, the routing resolves, and the feedback accumulates, and the
  COUNCIL HUB holds the per-session knowledge of the state, the signals, and the routes.
- The TRIBE system is the future and is recorded but NOT implemented now: the conversation is a
  conversation with n members of it, the members are the councils of the sessions, and the tribe
  needs a LEADER as the designated conversation that adjudicates and carries the cross-conversation
  knowledge of the shared feedback and the state, per the user's "we can then later figure out the
  tribe system".
- For now the council hub is the per-session knowledge store of the batch-state, the feedback
  journal, the queue, and the routes, which is the four members combined in effectuality and
  separate in functionality.

## 4. The exploration items

1. **The transfer mechanics.**

    The question is how the block of a child reaches the session log of the parent mechanically
    across the session boundaries of the parentage, and it uses the same inbox and session machinery
    that the batch-state probe investigates.

2. **The know and disknow UX.**

    The read-status and the optional surfaces of the council view are the deliberate access of the
    user.

3. **The honesty guarantee.**

    The block survives the chain un-sanitized, because the parents append and NEVER edit under the
    policy.

4. **The aggregation.**

    The liked and disliked clusters form the signal summary of the session.

## 5. The implementation phases

1. **The block format.**

    The block format and the journal, with the schema and the family conventions.

2. **The transfer service.**

    The mechanical push through the parentage.

3. **The read and disknow surface.**

    The status and the optional council view.

4. **The batch-state integration.**

    The signals in the compiled context.

5. **The queue integration.**

    The footers of the completion reports.

6. **The council hub.**

    The per-session knowledge store.

## 6. The safety and the compatibility

- The honest content is NEVER sanitized or filtered under the policy that the parents append deltas
  and NEVER rewrite the signals of the agents.
- The read is ALWAYS the choice of the recipient, the know or disknow, and it is NEVER forced.
- The family's plugin discipline holds: the smokes, the loader contract, and the no-commit rule.
- The override of the user wins, because the honest signals are his knowledge.
