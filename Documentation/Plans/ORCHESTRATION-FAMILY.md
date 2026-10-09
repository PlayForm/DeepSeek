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

- The + = the history's accumulation (the conversation's own blocks).
- The ⊕ = the block composition: the compiled members, ordered, bounded, pre-baked.
- The equation's instances: the conversation is Family(t) - the council is its
  state; the tribe is the composition of the councils: Tribe(t) = Σ Council_i(t)
  with a Leader.

### 8.4 THE COMBINATION SPACE (all the ways the members combine)

| # | The combination | The flow | The effect |
|---|---|---|---|
| 1 | S -> Q | the state changes drive the dispatch (a lane completes -> the queue's next) | the gate-driven queue |
| 2 | S -> C | the state compiled into the context blocks | the dynamic TOC |
| 3 | Q -> S | the tasks' states are the batch state | the queue as a state dimension |
| 4 | Q -> R | the dispatched tasks carry their routes | the routed dispatch |
| 5 | R -> C | the routes compiled into the context (the gates) | the routing truth |
| 6 | F -> S | the signals feed the state (the friction notes) | the council's observations |
| 7 | F -> R | the disliked routing feeds the policy review | the config's feedback loop |
| 8 | S -> F | the parents' deltas appended (the state observations) | the lineage deltas |
| 9 | Q -> F | the completions attach their feedback footers | the honest reports |
| 10 | P -> all | the parentage composes every member (the parents see the children's compiled summaries) | the tree's inheritance |
| 11 | Scope -> C | the projection (each agent sees the council filtered by its role) | the per-agent pre-baked view |
| 12 | t -> all | the recompilation on every state change | the constant-state-slot |
| 13 | Loop | the closed cycles (Family, the dispatch loop, the feedback loop) | the dynamic workflows |
| 14 | Council -> Tribe | the councils composed + a leader | the future tribe system |

- Every combination is the same primitives looped differently - the family's
  message bus: the blocks composed by the Compile operator, the queues
  (FIFO/LIFO) + the parentage for the ordering, the events for the triggers, the
  maximal utilization = the 14 rows' cross-feeding.

## 9. THE SPHERE COMPACTION (the layered visualization - user-mandated 2026-10-09)

The context blocks are the MIDDLE LAYER of a nested sphere: the tool calls
OVERWRITE them (the outer surface), the behaviors UNDERWRITE them (the inner
generators). The whole is sphere compaction - the layers feed inward, the
volume is held (the state replaced, the blocks bounded).

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

- The OVERWRITE semantics: a tool call's effect lands on the sphere's surface -
  the state-change event fires - the Compile re-generates the middle layer - the
  stale block is REPLACED (the tool call "overwrites" the block - the sphere's
  outer action compacts into the inner state).
- The UNDERWRITE semantics: the behaviors are the sphere's foundation - the
  policies + the functions guarantee the blocks' content (the "underwriting" =
  the middle layer is backed by the deterministic generators - the blocks are
  the policies' compiled outputs).
- The sphere compaction: the volume is CONSTANT-ish - the state slot replaced
  (never grown), the blocks bounded (the context budgets), the history's
  accumulation the only growth (+H - itself budgeted) - the family's maximal
  utilization: the same sphere, the 14 combinations looping inside it.

## 10. THE SUB-BLOCKS + THE PERMISSIONS (user-mandated 2026-10-09)

The middle-layer context blocks are not monolithic: they are COMPOSED OF
SUB-BLOCKS, each with a PERMISSION level - per tool, per model family, per
plugin functionality/behavior. The Compile operator becomes permission-aware:

```
Context(a, t) = Compile( Council(t) ⊙ Scope(a) ⊙ Perm(a) ) + H(a, t)

Perm(a) = f( tool(a), modelFamily(a), role(a), pluginBehavior(a) )
```

- The ⊙ = the SCOPE + PERMISSION projection: the agent sees only the sub-blocks
  its permissions admit - the pre-baked block filtered at compile time, never at
  read time (the permission is the compiler's input, not the agent's gate).

### 10.1 The sub-block catalog (the compiled block's internal structure)

| Sub-block | Content | The permission dimensions |
|---|---|---|
| TOC | the batch state (the lanes, the statuses, the queue view) | all agents (the universal baseline) |
| Scope | the agent's surfaces + the off-limits | role-bound (the coder sees the code surfaces, the explorer the read surfaces) |
| Gates | the arbiter truth (the build/smokes states) | tool-bound (the execution lanes see the gates, the explorers the summary) + model-family (the planner sees the full gate ledger, the GLM lanes the compact) |
| Routing | the resolved routes + the policy facts | model-family-bound (the planner's lane sees the routing truth for the review; the coder's lane sees only its own route) - the routing-enforcer's ledger is the planner/council sub-block |
| Queue | the tasks + the states + the next dispatch | parent-bound (the orchestrator's view: the full queue; the agents' view: their own task only) |
| Feedback | the honest signals + the deltas | READ-PERMISSION-bound (the know/disknow - the recipient's opt-in - the sub-block excluded until the read-permission is granted; the transfer never force-reads) |
| Policy | the user's config facts | plugin-behavior-bound (the routing-enforcer + the queue consult it; the agents never see it - the "you don't have to know" doctrine) |

### 10.2 The permission matrix (the alignment)

- PER TOOL: a sub-block's visibility follows the tooling - e.g. the Gates
  sub-block's full detail for the lanes running the build; the queue's internal
  state only via the dispatcher's surface; the write-tool's lanes see the
  ownership matrix (the Scope sub-block's file-level detail), the read-only
  lanes the summary.
- PER MODEL FAMILY: the sub-blocks' detail levels differ per the routing's
  family - the DeepSeek planner lane receives the FULL compiled view (the
  council's depth: the routes, the gates' ledger, the feedback summary - its
  planning needs the whole sphere); the GLM coder/explorer lanes receive the
  COMPACT pre-baked sub-blocks (their scope + the gates' summary + their own
  route - the minimal surface their behavior requires). The model family is the
  permission dimension - the routing-enforcer resolves the family, the Compile
  applies its detail level.
- PER PLUGIN BEHAVIOR: each member's functionality owns its sub-block's
  permissions - the feedback's read-permission (the know/disknow), the
  routing's policy-hiding (the agents never see the config - the
  "you don't have to know" doctrine), the queue's parent-bound visibility.

### 10.3 The sphere's alignment (the compaction + the permissions)

- The sphere's middle layer = the permissioned sub-blocks: the Compile outputs
  the filtered composition (Perm(a) is the compiler's input - the baked block
  arrives ALREADY filtered - the agent reads exactly what its permissions
  admit, nothing more - the "read mechanically" doctrine extends to the
  sub-block level).
- The compaction with the permissions: the sub-blocks' volume is bounded per
  permission class (the planner's full view vs the coder's compact view - the
  sphere's per-agent volume varies by the permission, the total held by the
  budgets).
- The sub-blocks' events: a permission change (the read-permission granted,
  the model-family switched) recompiles the affected sub-blocks - the
  sphere's surface updates in place.

### 10.4 The examples (the system's behavior)

- The FEEDBACK sub-block: excluded from every agent's compiled block by default
  (the read-permission off) - the recipient's deliberate grant compiles it in
  (the know); otherwise it transfers mechanically unread (the disknow) - the
  honest signals never surface uninvited.
- The ROUTING sub-block: the planner's compiled view carries the routing ledger
  (the council's review material); the coder's view carries only its own
  resolved route (the model-family permission).
- The POLICY sub-block: never compiled into any agent's block - the behaviors
  (the plugin funcs) consult it internally; the agents act on the compiled
  outputs without ever seeing the configuration (the user's responsibility,
  the system's silence).
