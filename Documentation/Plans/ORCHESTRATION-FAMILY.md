# THE ORCHESTRATION FAMILY - the integrated message bus (dedicated 2026-10-09)

> The user's mandate: think of the plugin family as an INTEGRATED MESSAGE BUS -
> disperse the information with the blocks + the active communication /
> programming paradigms already in place, looped in a different way - structured
> + integrated into the Hermes agent harness. All of these concepts are just
> FIFO/LIFO queues + parentage combined in different ways + maximal utilization,
> into dynamic "workflows" - e.g. a conversation. Keep the members' functionality
> SEPARATE, combine their effectuallity in the eventuallity of the system - when
> a conversation runs, the members activate invisibly (the user + the orchestrator
> don't see them) - the COUNCIL HUB is activated, always pertaining knowledge per
> session. The TRIBE system comes later (conversation + n members + a leader).

## 1. The members (separate in functionality)

| Member | Plan | Function | The paradigm it realizes |
|---|---|---|---|
| BATCH-STATE | BATCH-STATE-PLUGIN.md | the compiled context (the pre-baked TOC/Scope/Gates - Context = Compile(State)) | the SHARED STATE - the context as a function of the cooperation |
| ROUTING-ENFORCER | ROUTING-ENFORCER-PLUGIN.md | the silent auto-routing (the user's policy is the law) | the POLICY - the configuration as the deterministic input |
| SUBAGENT-QUEUE | SUBAGENT-QUEUE-PLUGIN.md | the task queue + the capacity model (10 held / 2 children) | the QUEUES - FIFO/LIFO + the parentage + the dispatch |
| HONEST-FEEDBACK | HONEST-FEEDBACK-PLUGIN.md | the honest signals (the liked/disliked blocks, transferred unread) | the FEEDBACK - the information flowing the lineage, mechanically |

## 2. The message bus (the combined effectuallity)

- The four members share the primitives: the BLOCKS (the context blocks - the
  batch-state compiles them, the queue dispatches them, the routing resolves
  them, the feedback appends them), the QUEUES (FIFO/LIFO + the parentage - the
  tasks' dispatch order, the feedback's lineage flow), the EVENTS (the cordis
  events - the state changes, the completions, the signals).
- The members LOOP the paradigms in different ways: the state is a shared block;
  the tasks are a FIFO queue with the priority; the feedback is a LIFO-ish
  lineage chain (the newest delta first); the routing is a pure function - the
  same primitives, different combinations = the dynamic workflows (a
  conversation is one such workflow: the state compiled, the tasks dispatched,
  the routes resolved, the signals accumulated - all invisibly).
- The eventual system: when a conversation runs, the members activate (the
  user + the orchestrator don't see them) - the COUNCIL HUB holds the
  per-session knowledge (the state + the queue + the routes + the feedback).

## 3. The council hub (the per-session knowledge)

- The hub = the four members' stores unified: the batch state (the lanes, the
  gates), the queue (the tasks + the states), the routes (the resolved ledger),
  the feedback journal (the signals + the deltas). All journaled (the family
  conventions) + all compiled (the batch-state's context blocks).
- The hub's activation: invisible - the members' services run in the harness's
  background; the orchestrator's tooling stays unchanged (the queue's
  dispatcher + the routing's resolver + the feedback's collector are the
  harness's own machinery).
- The hub's knowledge: per session (the session's state + signals) - the raw
  material for the tribe system.

## 4. The tribe system (the future - recorded, not implemented)

- The conversation is (conversation + n members of it): the members are the
  conversations' councils; the tribe = the connected conversations sharing the
  knowledge (the cross-session feedback + the state + the leaders).
- The tribe needs a LEADER (the designated conversation that adjudicates the
  shared signals + the cross-tribe dispatch).
- The user's direction: "we can then later figure out the tribe system" - the
  council hub is the foundation (the per-session knowledge) the tribe builds on.

## 5. The shared probe (the one investigation, three consumers)

The three implementation investigations share the same probe phase:
1. The harness's inbox/session mechanics (the batch-state's splice + the
   feedback's transfer - the agent/inbox/spliced machinery).
2. The pool/reservation surface (the queue's capacity + the routing's launch
   path - the per-root-lineage pool, the maxActiveSubagents knob).
3. The config application (the patch-load at startup + the volatile settings).

## 6. The family's rules

- The members' functionality SEPARATE (each plugin owns its one concern); the
  effectuallity COMBINED (the stores integrated, the context compiled, the
  events shared).
- The user's configuration is the law (the routing policy + the capacity model +
  the honest content's sanctity).
- The family's plugin discipline (the smokes, the loader contracts, the
  no-commit, the ledger conventions).
- The invisible operation: the members never surface to the user or the
  orchestrator unless asked (the council view is the deliberate access).

## 7. The deliverables

- The four member plugins (the plans ready) + the shared probe's findings.
- The council hub's store integration (the batch-state's state + the queue +
  the routes + the feedback journal).
- The tribe system's foundation (the per-session knowledge + the leadership
  design - the future session).