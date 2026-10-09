# HONEST-FEEDBACK PLUGIN - the fourth orchestration member (dedicated 2026-10-09)

> The user's mandate: "an HONEST feedback footer, which inserts a dynamic HONEST
> feedback block which can be transferred (without being read) - it's always
> modified in parent sessions, to know / disknow what the sub agents liked /
> disliked". The plugin family is an INTEGRATED MESSAGE BUS - the information
> disperses with the blocks + the communication/programming paradigms already in
> place (FIFO/LIFO queues + parentage combined in different ways + maximal
> utilization into dynamic workflows - a conversation).

## 0. The concept (the honest signals)

- Every agent's completion carries an HONEST feedback block: what it LIKED and
  DISLIKED - the friction points, the spec ambiguities, the environment issues
  (the concurrent lanes, the broken states, the tooling), the routing, the
  coordination - the agent's genuine signals, free of the report's politeness.
- The block is TRANSFERRED THROUGH THE PARENTAGE mechanically: child -> parent ->
  grandparent sessions - always modified in the parent sessions (the parents
  append their own observations + the deltas) - the block flows UP without being
  READ by the passers (the transfer is mechanical; the reading is the recipient's
  CHOICE - "to know / disknow" - the recipient decides when to read it, the
  transfer never forces the reading).
- The signals accumulate per session (the council knowledge) - the raw material
  for the future TRIBE system (conversation + n members + a leader).

## 1. The block format (the dynamic footer)

```
[HONEST FEEDBACK - <agent id> - <task> - <session>]
LIKED: <the agent's genuine likes - the spec, the environment, the tools>
DISLIKED: <the frictions - the ambiguities, the broken states, the concurrency>
DELTAS: <the parent sessions' appends - the observations the passers added>
TRANSFERRED: <the path: child -> parent -> ... - the mechanical chain>
READ-STATUS: unread / read-at <session>   <- the recipient's choice, recorded
```

- The block is appended to the agent's completion report (the footer) + written
  to the feedback journal (the family's conventions - the v2 domain).
- The block's transfer: the parent sessions append their DELTAS (their own
  observations - "this lane's friction matches the earlier lane's") - the block
  is always modified as it passes - never sanitized, never filtered - the honest
  content survives the chain.

## 2. The architecture: `@playform/plugin-dsh-feedback` (the fourth family member)

### 2.1 The feedback journal (the council knowledge)

- The per-session feedback log (the family's journal conventions): every agent's
  block appended at its completion; the parent sessions' deltas appended; the
  read-statuses recorded.
- The journal is part of the batch-state plugin's store (the council knowledge is
  a first-class state dimension - the compiler's context can surface the signals
  pre-baked when the recipient opts in).

### 2.2 The transfer service (the mechanical chain)

- `feedback/push(block, path)` - the block's transfer through the parentage: the
  child's block pushed to its parent's session log; the parent appends its deltas
  + pushes onward - the mechanical FIFO through the lineage (the parentage is the
  queue: the feedback flows the tree upward, one hop per session boundary).
- `feedback/read(agentId, session)` - the recipient's OPTIONAL read (the
  know/disknow choice): the block is never force-read; the read-status recorded
  when the recipient opens it.
- `feedback/summary(session)` - the council view: the session's aggregate signals
  (the liked/disliked clusters) - for the recipient's deliberate review.

### 2.3 The integration with the orchestration layer

- The batch-state plugin: the feedback journal's state (the blocks' count, the
  unread signals, the latest deltas) in the compiled context - the council hub's
  visibility per session.
- The subagent-queue plugin: the task completions emit the feedback blocks (the
  queue's dispatcher attaches the block to the completion report).
- The routing-enforcer: the DISLIKED signals about the routing feed the ledger
  (the "the routing felt wrong" observations - the config's review material).

## 3. The council hub (the eventual system)

- When a conversation runs, the orchestration members activate INVISIBLY (the
  user + the orchestrator do not see them - the plugins work in the background):
  the batch-state compiles the context, the queue dispatches, the routing
  resolves, the feedback accumulates - the COUNCIL HUB holds the per-session
  knowledge (the state + the signals + the routes).
- The TRIBE system (the future - recorded, not implemented now): the conversation
  is (conversation + n members of it) - the members are the sessions' councils;
  the tribe needs a LEADER (the designated conversation that adjudicates) - the
  cross-conversation knowledge (the tribe's shared feedback + the state) - the
  user's "we can then later figure out the tribe system".
- For now: the council hub = the per-session knowledge store (the batch-state +
  the feedback journal + the queue + the routes) - the four members combined in
  effectuallity, separate in functionality.

## 4. The exploration items

1. The transfer mechanics: the parentage's session boundaries (how a child's
  block reaches the parent's session log mechanically - the same inbox/session
  machinery the batch-state probe investigates).
2. The know/disknow UX: the read-status + the optional surfaces (the council
  view - the user's deliberate access).
3. The honesty guarantee: the block survives the chain un-sanitized (the
  parents append, never edit - the policy).
4. The aggregation: the liked/disliked clusters (the session's signal summary).

## 5. The implementation phases

1. The block format + the journal (the schema + the family conventions).
2. The transfer service (the mechanical push through the parentage).
3. The read/disknow surface (the status + the optional council view).
4. The batch-state integration (the signals in the compiled context).
5. The queue integration (the completion reports' footers).
6. The council hub (the per-session knowledge store).

## 6. The safety + the compatibility

- The honest content is NEVER sanitized or filtered (the policy: the parents
  append deltas, never rewrite the agents' signals).
- The read is always the recipient's choice (the know/disknow - never force-read).
- The family's plugin discipline (the smokes, the loader contract, the no-commit).
- The user's override wins (the honest signals are his knowledge).