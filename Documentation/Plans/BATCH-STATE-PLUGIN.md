---
title: The Batch-State Plugin - the cooperative context plan
category: Plans
kind: queued-plan
date: 2026-10-08
status: implemented (PoC)
registry: Documentation/Plans/BATCH-STATE-PLUGIN.md
index: Documentation/INDEX.md
statuses:
    - name: the batch-state plugin (the compiled context)
      state: implemented (PoC)
      evidence:
          plugin-dsh-batchstate under Classic/packages/ (with its ets-plugin-dsh-batchstate twin);
          the PoC-vs-plan grades in Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the dynamic block concept (Context = Compile(State))
      state: implemented (PoC)
      evidence:
          the compiled-context board in plugin-dsh-batchstate; the grades in
          Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the interim equivalent (the live-containers dynamic context)
      state: implemented
      evidence: hook-dsh-live-containers - the wave-2 dynamic-context carrier
---

# BATCH-STATE PLUGIN - the cooperative context plan (dedicated 2026-10-08)

> The mandate of the user: "harness the full agent's power harness", which means the best, fullest,
> and most un-afraid compatibility with context modification and programmatic use. The goal: the
> context of EVERY agent becomes a FUNCTION of the co-operative approach, which gives a dynamic
> table of contents at the top of the conversation plus a dynamic retrieval that prompts the others,
> so the batch state is ALWAYS visible and ALWAYS current, and the agents stay in scope.

## 0. The concept (the user's words, confirmed)

- ANY subagent can access the WORKING ENVIRONMENT, the current ongoing IDLEs, and their CURRENTLY
  ACTIVE TASK, which is the LIVE state and NOT the initial spec and NOT what was given at the
  beginning, but what they are doing RIGHT NOW.
- A PROGRAMMATIC ORCHESTRATION in the plugin: a STATE-CHANGE mechanism where the state transitions
  (running -> completed -> failed, the queue movements, and the task updates) are events that the
  plugin owns.
- A DYNAMIC CONTEXT BLOCK: a LIVE table of contents at the top of EVERY agent's conversation that is
  updated when the state changes, so EACH agent sees the batch at a glance, plus the dynamic
  retrieval prompts (the reminders of the scope and the concurrent lanes).
- CONTEXT = f(cooperative state): the plugin INJECTS and REFRESHES the context block, so the working
  context of the agent reflects the LIVE cooperative state at EVERY step, which is "a context
  becomes a function of this co-operative approach".

## 1. The harness ground truth (verified from this session)

- The session records (~/.dsh/sessions/*/session.v4.jsonl.zstd) carry the line type
  `agent/inbox/spliced`, which shows that the agent-loop plugin (the dsh-agent-loop bundle in the
  profile) has an INBOX mechanism that can splice content into the inbox of an agent. The record
  also shows `agent/inbox/spliced` entries BEFORE the turns, so the inbox is the delivery channel
  for the messages of the parent (the activations and the amendments), and the plugin CAN project
  content into it.
- The plugin architecture of the family (the cordis plugins: the factory, the governor, the pinner,
  and the normalize family) with its Services, Events, and Config schemas is the proven template,
  because a batch-state plugin is just another cordis plugin in the same family (the
  @playform/plugin-dsh-* pattern).
- The plugin_manager and the profile's bundles (the dsh-agent-loop config in cordis.patch.yml with
  the agents' roles of coder, explorer, and planner) mean that the batch-state plugin EXTENDS the
  territory of the agent-loop (the agent lifecycle) WITHOUT replacing it.
- The current mechanisms of the parent (the state blocks in the messages, the process records in
  TOMORROW-REVIEW, and the disciplines of the skills) are the FALLBACKS, and the plugin replaces the
  manual broadcast with the programmatic state.

## 2. The architecture (the full design)

### 2.1 The plugin: `@playform/plugin-dsh-batchstate` (a new family plugin)

A cordis plugin in the conventions of the family (the loader contract of name/apply/Config/inject,
the factory flavor of inject fs/pluginFactory, and the smokes as the arbiter):

- **The state store** (the ledger-backed store of the plugin, either the v2 journal domain or a
  plain JSON store under the profile): the batch state, which holds the agents (id, role, the task
  title, the CURRENT ACTIVITY as the last-updated phase or target, the status of
  idle/active/completed/failed/interrupted, the queue position, the scope as the surfaces it owns,
  the started and finished timestamps, and the last report hash).
- **The Service API** (`batchstate/state`): read-only methods that the SUBAGENTS can call:
    - `getState()` - the full batch snapshot (the running lanes, their CURRENT tasks, the idle
      queue, and the recent completions).
    - `getContext()` - the dynamic context block for a given agent (the table of contents, the scope
      reminders, and the pending list, which is what gets spliced).
    - `getScope(agentId)` - the surfaces that the agent owns against the surfaces that other lanes
      own.
    - `whoElse()` - the CURRENT activities of the concurrent lanes (the "you are never alone"
      block).
- **The write API** (the PARENT and orchestrator side plus the plugin's own events):
    - `setTask(agentId, task)` - update the CURRENT ACTIVITY (the LIVE task, where the agents report
      their phase changes and the parent sets the task at the activation).
    - `setStatus(agentId, status)` - the state transitions (idle -> active -> completed -> failed ->
      interrupted, and the queue movements).
    - `setScope(agentId, surfaces)` - the scope registry.
- **The events**: `batch/state-change` (the cordis event that broadcasts the state transitions, with
  the splice trigger and ANY listening agent as the consumers).

### 2.2 The context-block mechanism (the dynamic table of contents)

- The plugin SPLICES the context block into the inboxes of the agents through the inbox projection
  of the agent-loop (`agent/inbox/spliced`, the mechanism that the session records prove): a
  `<batch-state>` block at the top of the next inbox read of the agent, which is the dynamic table
  of contents:
    ```
    [BATCH STATE - live]
    RUNNING: 3 lanes
      p-tag-repair     fixing the <p> tags (build-verified loop) - OWNER: the site pages
      file-icons       the file-type icons + log chips - OWNER: the site mentions
      line-break (redo) queued behind the repair - OWNER: the newline rendering
    IDLE: 9 (wiring-grid, apostrophe-entity, provenance-cleanup, repetition-sweep,
          code-token, heading-space, header-hamburger, badge-icon, grid-overflow)
    YOUR SCOPE: <the agent's surfaces> - OFF-LIMITS: <the other lanes' surfaces>
    PENDING: <the queue order>
    ```
- The REFRESH trigger: on EVERY state-change event, the plugin re-splices the updated block into the
  inboxes of the affected agents, so the next read carries the fresh state and the context becomes a
  FUNCTION of the state: `Context(agent, t) = f(State(t), agent)`.
- The block is READ-ONLY for the agents, because it is the injected context and NEVER their own
  content, and it sits at the top of the inbox projection, clearly delimited.

### 2.3 The dynamic retrieval (the prompts for the others)

- The activation or amendment message of EVERY agent ALREADY carries the state block (the format of
  the parent), and the plugin REPLACES the manual broadcast, so the agents CALL the service
  (`batchstate/state.getState()`) or READ the spliced block, and BOTH paths give the LIVE state (the
  current activities and NOT the initial specs).
- The scope enforcement: the OFF-LIMITS list of the block plus the `getScope()` of the Service, so
  the agents verify before they touch a file ("is this file mine? the state says the file-icons lane
  owns the mention surfaces").
- The build-verified and surgical-edit disciplines stay in the skills, and the plugin ADDS the LIVE
  awareness.

### 2.4 The orchestration (the programmatic state changes)

- The activation flow of the parent goes THROUGH the plugin: `setTask(agent, task)` and
  `setStatus(agent, "active")` on activation, the agents report their phase changes
  (`setTask(agent, "fixing the index hero")`), and the completions set the status and trigger the
  next pair of the queue (the orchestrator view of the plugin).
- The queue management: the plugin holds the idle queue and the pair schedule, so the state changes
  drive the activations while the parent reviews and confirms and the plugin proposes the next pair.

## 3. The exploration items (the questions the implementation must resolve)

1. THE INBOX-SPLICING MECHANICS: how the `agent/inbox/spliced` of the agent-loop works exactly,
   which covers the record shape, the trigger, the timing (before the next turn?), and the limits
   (the block size and the splice frequency). The fallback if the splicing is NOT fully exposed: the
   plugin WRITES the state block to a well-known file (e.g.
   ~/.dsh/profiles/desktop/batch-state.json) and the prompts of the agents instruct them to read it
   (the dynamic retrieval through the file), which is the same function with less intrusion.
2. THE SERVICE EXPOSURE: can the tool layer of the SUBAGENTS call a service of a cordis plugin? The
   inspect providers show the services to the parent, so the subagents would need the same (a tool
   that the harness exposes to the agents, or the file-based fallback). The resolution: probe the
   tool and service exposure of the harness for the subagents during the implementation.
3. THE CONTEXT-MODIFICATION COMPATIBILITY: the "most un-afraid" mandate means that the block must
   NEVER modify the OWN content of the agents (their messages, their spec, and their work) and ONLY
   the injected top-of-context block. The inbox of the harness is the sanctioned channel (the
   agent-loop already uses it), so the plugin rides it.
4. THE STATE SOURCE OF TRUTH: the store of the plugin against the process records and the messages
   of the parent, where the store is the LIVE truth, the records are the durable log, and the
   messages carry the deltas. The reconciliation on restarts holds because the store survives
   through the ledger.
5. THE SIZE + the FREQUENCY: the block must stay compact (the table of contents, the scope, and the
   pending, and NOT the full histories), and the re-splice happens on the state changes ONLY and NOT
   per message, which gives the dynamic WITHOUT the noise.
6. THE LIVE-TASK TRACKING: how the agents report their CURRENT ACTIVITY, with the convention that at
   EACH phase change the agent calls setTask (or the parent updates on the phase messages), which
   satisfies the "not what's been given in the beginning, what they are doing right now"
   requirement.

## 4. The implementation phases

1. **The probe**: the inbox-splicing mechanics and the subagent service exposure (exploration items
   1 and 2, as a minimal spike plugin with a static state block spliced into ONE inbox of an agent
   and a service that the parent queries).
2. **The skeleton**: the batchstate plugin (the loader contract, the Config, the store, the Service
   API, and the events) plus the smokes.
3. **The splice**: the dynamic context block plus the refresh-on-state-change.
4. **The orchestration**: the activation flow of the parent through the plugin (the
   setTask/setStatus on the activations, the completions, and the queue).
5. **The agent-facing retrieval**: the access path of the subagents (the service or the file-based
   fallback) plus the prompt instruction to read the LIVE state.
6. **The fallbacks**: if a mechanism is NOT exposed, the file-based state (the well-known JSON that
   the agents read) and the message state blocks of the parent stay.

## 5. The safety + the compatibility rules

- The context block is READ-ONLY, clearly delimited, and compact, and it is NEVER the own content of
  the agents and NEVER their work product.
- The state store rides the ledger conventions of the family (the journal domain, the byte
  integrity, and the tabs).
- The plugin follows the plugin discipline of the family (the smokes as the arbiter, the loader
  contract, the factory flavor, and the no-commit regime).
- The override of the user ALWAYS wins, because the plugin is a TOOL and the parent orchestrates.

## 6. The deliverables (for the implementation session)

- The plugin source (in the family conventions) plus the smokes.
- The service and event definitions (the exact schemas).
- The findings of the probe (the inbox mechanics and the subagent exposure).
- The fallback implementation (the file-based state) if it is needed.
- The skill update for the agents (the idle-agent-protocol and the worker-strains: "read the LIVE
  state from the plugin or file and NEVER assume").
- The documentation of the state schema and the orchestration flow.

## 7. THE PRE-BAKED ORCHESTRATION COMPILER (the advanced use case - user-mandated 2026-10-08)

The refinement of the user: "everything is dynamic / inside the context, but NOT understood
dynamically - it's all pre-baked, pre-compiled and programmatically enhanced".

The orchestration becomes a COMPILER and NOT a runtime chatter: the state flows, EVERY context
artifact is a COMPILED OUTPUT that is deterministic, pre-generated, and injected, and the agents
READ the baked blocks and NEVER reason about the batch state.

### 7.1 The compiler (the orchestration layer's core)

The plugin plus the deterministic rules of the parent form a compiler with pure functions:

```
State(t) = the live batch (the lanes, their CURRENT tasks, the statuses, the queue, the arbiter states)
Compiler = {
  TOC(State(t))        -> the dynamic table-of-contents block (pre-generated text)
  Scope(agent, State)  -> the agent's compiled scope block (its surfaces + the OFF-LIMITS + the overlaps)
  Prompt(agent, State) -> the compiled activation template (the task + the state + the disciplines)
  Queue(State(t))      -> the compiled schedule (the next pairs, the priorities)
  Gates(State(t))      -> the compiled arbiter truth (the build green/red, the smokes, WHO broke it)
}
Context(agent, t) = [ TOC | Scope(agent) | Gates | History(agent) ]   <- the baked block, recompiled on
                                                                         every state change, injected in
                                                                         place - constant-size, always current
```

- EVERY block that the agents receive is a COMPILED OUTPUT, and the ONLY role of the LLM is to READ
  it and act. The batch state is NEVER described ad-hoc by ANY agent, because the compiler owns the
  exact wording.
- The RE-COMPILE triggers: the state changes (setTask/setStatus) recompile the affected blocks (the
  TOC, the scopes, and the gates) and re-inject them into the same slots, replaced. "Dynamic" means
  that the state flows, and "pre-baked" means that the compilation is deterministic and
  programmatic, with zero reasoning about the batch by anyone.

### 7.2 The programmatic enhancements (what the compiler computes BEYOND the visible state)

1. THE FILE-OWNERSHIP MATRIX: the compiler computes the surface set of EVERY lane and the pairwise
   overlaps, and the Scope blocks are generated from the matrix, so a block of a lane says exactly:
   "YOURS: <files> - SHARED WITH <lane> (read-before-edit): <files> - OFF-LIMITS: <files>", which
   makes the conflict avoidance pre-baked and NOT negotiated.
2. THE GATE TRUTH: the compiler tracks the arbiter states (the site build and the smokes), and the
   Gates block tells EVERY lane "THE TREE IS GREEN" or "THE TREE IS RED: <the in-flight edit of the
   lane broke <file>>", which is the programmatic truth computed from the actual runs (the plugin
   runs and observes the gates) and NEVER the claims of the agents.
3. THE QUEUE PROJECTION: the compiled schedule (the current pair, the next pairs, and the priorities
   from the deterministic rules of the surface disjointness and the dependencies), so the lanes see
   their future slots pre-baked.
4. THE REPORT AGGREGATION: the completion reports feed the state, and the compiler aggregates the
   results into the next blocks (the "X lane landed: <summary>" lines in the TOC), so the manual
   reporting of the parent becomes the compiled delta.
5. THE CONTEXT-BUDGET CONTROL: EVERY block is size-bounded (the compact TOC, the scope, and the
   gates, and NEVER the histories), which gives the constant-state-slot guarantee: the state portion
   of the context NEVER grows, regardless of the duration of the batch.
6. THE PROMPT COMPILATION: the activations and amendments of the parent become TEMPLATES that the
   compiler fills (the task, the state block, and the disciplines, generated and NOT hand-written),
   so the message writing is programmatic and the parent reviews the compiled prompts instead of
   composing them.

### 7.3 The most advanced case usage (the full picture)

- THE WHOLE-FAMILY ORCHESTRATION: the plugin serves EVERY batch (the DeepSeek site, the family
  packages, and the future Aphrodite session) with ONE state store and the compiled blocks per
  batch, and the multi-project sessions share the plugin, isolated by the batch keys.
- THE IDLE-AGENT LIFECYCLE, PRE-BAKED: the specs of the idle agents are the compiled artifacts, and
  the activation is the compiler injecting the compiled activation block (the task, the state, and
  the scope), so the manual message writing of the parent is replaced by the output of the compiler
  where the parent confirms and the plugin generates.
- THE AUTO-SCOPING: the file-ownership matrix makes the "stay in scope" discipline PROGRAMMATIC, and
  the compiled Scope blocks eliminate the surface fights, so the Line-break unclosed-<p> class of
  incident becomes structurally impossible, because the per-file ownership of the compiler and the
  red-flagging of the gates catch the breakage at THE FIRST state change.
- THE GATE-DRIVEN QUEUE: the queue advances on the compiled gate truth, because a lane cannot
  complete until its gates are green and the state machine enforces it, so the "build-verified after
  EVERY file" rule becomes the state transition of the plugin and NOT the advice of a prompt.
- THE REPORT LOOP: the completion of EVERY lane recompiles the TOC and the queue, so the batch
  becomes a closed loop: State -> Compile -> Inject -> Act -> Report -> State.

### 7.4 The implementation deltas (beyond the base plan)

- The compiler module (pure functions per 7.1) with the TOC, Scope, Prompt, Queue, and Gates
  generators.
- The file-ownership registry (fed by the scope declarations of the parent at the activations, from
  which the compiler derives the matrix).
- The gate observer (the plugin runs and observes the build and the smokes, and it builds the Gates
  block from the actual exit codes).
- The prompt templates (the compiled activations and the confirm flow of the parent).
- The multi-batch support (the batch keys and the isolated state).
- The extended scope of the probe: the inbox-replacement mechanics (does the splice replace the
  prior block?), with the fallback of the compiled blocks written to the state file that the agents
  read.

### 7.5 The user's model, confirmed

OLD: BLOCK, BLOCK, BLOCK, NEW BLOCKS (the state descriptions accumulate in the history, repetitive
and stale).

NEW: DYNAMIC BLOCK (recompiled and replaced on EVERY send, constant size, and NEVER extending the
conversation) + BLOCK, BLOCK, BLOCK, NEW BLOCKS.

And the refinement: the DYNAMIC BLOCK is NOT "understood" but COMPILED, because it holds the
pre-baked outputs of the deterministic orchestration compiler, injected programmatically and read
mechanically by the agents, which is "a context becomes a function of this co-operative approach":
Context = Compile(State).
