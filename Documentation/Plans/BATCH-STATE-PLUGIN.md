# BATCH-STATE PLUGIN - the cooperative context plan (dedicated 2026-10-08)

> The user's mandate: "harness the full agent's power harness" - the best, fullest, most
> un-afraid compatibility with context modification + programmatic use. The goal: every
> agent's context becomes a FUNCTION of the co-operative approach - a dynamic table of
> contents at the top of the conversation + a dynamic retrieval which prompts the others,
> so the batch state is always visible + always current, and the agents stay in scope.

## 0. The concept (the user's words, confirmed)

- ANY subagent can access the WORKING ENVIRONMENT + the current ongoing IDLEs + their
  CURRENTLY ACTIVE TASK (the live state - not the initial spec, not what was given at the
  beginning - what they are doing RIGHT NOW).
- A PROGRAMMATIC ORCHESTRATION in the plugin: a STATE-CHANGE mechanism - the state
  transitions (running -> completed -> failed, the queue movements, the task updates)
  are events the plugin owns.
- A DYNAMIC CONTEXT BLOCK: a live table of contents at the top of every agent's
  conversation - updated when the state changes - so each agent sees the batch at a
  glance, plus the dynamic retrieval prompts (the reminders of the scope + the
  concurrent lanes).
- CONTEXT = f(cooperative state): the context block is INJECTED + REFRESHED by the
  plugin - the agent's working context reflects the live cooperative state at every
  step - "a context becomes a function of this co-operative approach".

## 1. The harness ground truth (verified from this session)

- The session records (~/.dsh/sessions/*/session.v4.jsonl.zstd) carry the line type
  `agent/inbox/spliced` - the agent-loop plugin (the dsh-agent-loop bundle in the
  profile) has an INBOX mechanism: content can be spliced into an agent's inbox. The
  record also shows `agent/inbox/spliced` entries BEFORE the turns - the inbox is the
  delivery channel for the parent's messages (the activations, the amendments) - the
  plugin CAN project content into it.
- The family's own plugin architecture (the cordis plugins: the factory, the governor,
  the pinner, the normalize family) - the Services, the Events, the Config schemas -
  is the proven template: a batch-state plugin is just another cordis plugin in the
  same family (the @playform/plugin-dsh-* pattern).
- The plugin_manager + the profile's bundles (the dsh-agent-loop config in
  cordis.patch.yml - the agents' roles: coder/explorer/planner) - the batch-state
  plugin EXTENDS the agent-loop's territory (the agent lifecycle) without replacing it.
- The parent's current mechanisms (the state blocks in the messages, the process
  records in TOMORROW-REVIEW, the skills' disciplines) are the FALLBACKS - the plugin
  replaces the manual broadcast with the programmatic state.

## 2. The architecture (the full design)

### 2.1 The plugin: `@playform/plugin-dsh-batchstate` (a new family plugin)

A cordis plugin in the family's conventions (the loader contract: name/apply/Config/
inject; the factory flavor: inject fs/pluginFactory; the smokes as the arbiter):

- **The state store** (the plugin's own ledger-backed store - the v2 journal domain or
  a plain JSON store under the profile): the batch state - the agents (id, role, the
  task title, the CURRENT ACTIVITY (the last-updated phase/target), the status
  (idle/active/completed/failed/interrupted), the queue position, the scope
  (the surfaces it owns), the started/finished timestamps, the last report hash.
- **The Service API** (`batchstate/state`): read-only methods the SUBAGENTS can call:
  - `getState()` - the full batch snapshot (the running lanes + their CURRENT tasks +
    the idle queue + the recent completions).
  - `getContext()` - the dynamic context block for a given agent (the table of
    contents + the scope reminders + the pending list - what gets spliced).
  - `getScope(agentId)` - the surfaces the agent owns vs the surfaces other lanes own.
  - `whoElse()` - the concurrent lanes' CURRENT activities (the "you are never alone"
    block).
- **The write API** (the PARENT/orchestrator side + the plugin's own events):
  - `setTask(agentId, task)` - update the CURRENT ACTIVITY (the live task - the
    agents report their phase changes; the parent sets the task at the activation).
  - `setStatus(agentId, status)` - the state transitions (idle -> active -> completed
    -> failed -> interrupted; the queue movements).
  - `setScope(agentId, surfaces)` - the scope registry.
- **The events**: `batch/state-change` (the cordis event - the state transitions
  broadcast; the consumers: the splice trigger + any agent listening).

### 2.2 The context-block mechanism (the dynamic table of contents)

- The plugin SPLICES the context block into the agents' inboxes via the agent-loop's
  inbox projection (`agent/inbox/spliced` - the mechanism the session records prove):
  a `<batch-state>` block at the top of the agent's next inbox read - the dynamic
  table of contents:
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
- The REFRESH trigger: on every state-change event, the plugin re-splices the updated
  block into the affected agents' inboxes (the next read carries the fresh state) -
  the context becomes a FUNCTION of the state: `Context(agent, t) = f(State(t), agent)`.
- The block is READ-ONLY for the agents (the injected context - never their own
  content; it sits at the top of the inbox projection, clearly delimited).

### 2.3 The dynamic retrieval (the prompts for the others)

- Every agent's activation/amendment message ALREADY carries the state block (the
  parent's format) - the plugin REPLACES the manual broadcast: the agents CALL the
  service (`batchstate/state.getState()`) or READ the spliced block - both paths give
  the LIVE state (the current activities, not the initial specs).
- The scope enforcement: the block's OFF-LIMITS list + the Service's getScope() -
  the agents verify before touching a file ("is this file mine? - the state says the
  file-icons lane owns the mention surfaces").
- The build-verified + the surgical-edit disciplines stay (the skills) - the plugin
  ADDS the live awareness.

### 2.4 The orchestration (the programmatic state changes)

- The parent's activation flow goes THROUGH the plugin: `setTask(agent, task)` +
  `setStatus(agent, "active")` on activation; the agents report their phase changes
  (`setTask(agent, "fixing the index hero")`); the completions set the status +
  trigger the queue's next pair (the plugin's orchestrator view).
- The queue management: the plugin holds the idle queue + the pair schedule - the
  state changes drive the activations (the parent reviews + confirms; the plugin
  proposes the next pair).

## 3. The exploration items (the questions the implementation must resolve)

1. THE INBOX-SPLICING MECHANICS: how the agent-loop's `agent/inbox/spliced` works
   exactly - the record shape, the trigger, the timing (before the next turn?), the
   limits (the block size, the splice frequency). The fallback if the splicing is not
   fully exposed: the plugin WRITES the state block to a well-known file (e.g.
   ~/.dsh/profiles/desktop/batch-state.json) + the agents' prompts instruct them to
   read it (the dynamic retrieval via the file) - the same function, less invasive.
2. THE SERVICE EXPOSURE: can a cordis plugin's service be called BY THE SUBAGENTS'
   tool layer? The inspect providers show the services to the parent - the subagents
   would need the same (a tool the harness exposes to the agents - or the file-based
   fallback). The resolution: probe the harness's tool/service exposure for the
   subagents during the implementation.
3. THE CONTEXT-MODIFICATION COMPATIBILITY: the "most un-afraid" mandate - the block
   must NEVER modify the agents' OWN content (their messages, their spec, their
   work) - only the injected top-of-context block. The harness's inbox is the
   sanctioned channel (the agent-loop already uses it) - the plugin rides it.
4. THE STATE SOURCE OF TRUTH: the plugin's store vs the process records vs the
   parent's messages - the store is the live truth; the records are the durable log;
   the messages carry the deltas. The reconciliation on restarts (the store survives
   via the ledger).
5. THE SIZE + the FREQUENCY: the block must stay compact (the table of contents +
   the scope + the pending - not the full histories); the re-splice on the state
   changes only (not per-message) - the dynamic without the noise.
6. THE LIVE-TASK TRACKING: how the agents report their CURRENT ACTIVITY - the
   convention: at each phase change, the agent calls setTask (or the parent updates
   on the phase messages) - the "not what's been given in the beginning - what they
   are doing right now" requirement.

## 4. The implementation phases

1. **The probe**: the inbox-splicing mechanics + the subagent service exposure
   (the exploration item 1+2 - a minimal spike plugin: a static state block spliced
   into one agent's inbox + a service the parent queries).
2. **The skeleton**: the batchstate plugin (the loader contract, the Config, the
   store, the Service API, the events) + the smokes.
3. **The splice**: the dynamic context block + the refresh-on-state-change.
4. **The orchestration**: the parent's activation flow through the plugin (the
   setTask/setStatus on the activations + the completions + the queue).
5. **The agent-facing retrieval**: the subagents' access path (the service or the
   file-based fallback) + the prompts' instruction to read the live state.
6. **The fallbacks**: if a mechanism is not exposed, the file-based state (the
   well-known JSON + the agents read it) + the parent's message state blocks stay.

## 5. The safety + the compatibility rules

- The context block is READ-ONLY + clearly delimited + compact (never the agents'
  own content; never their work product).
- The state store rides the family's ledger conventions (the journal domain, the
  byte-integrity, the tabs).
- The plugin follows the family's plugin discipline (the smokes as the arbiter, the
  loader contract, the factory flavor, the no-commit regime).
- The user's override always wins; the plugin is a TOOL - the parent orchestrates.

## 6. The deliverables (for the implementation session)

- The plugin source (the family conventions) + the smokes.
- The service + the event definitions (the exact schemas).
- The probe's findings (the inbox mechanics + the subagent exposure).
- The fallback implementation (the file-based state) if needed.
- The agents' skill update (the idle-agent-protocol + the worker-strains: "read the
  live state from the plugin/file - never assume").
- The documentation of the state schema + the orchestration flow.
## 7. THE PRE-BAKED ORCHESTRATION COMPILER (the advanced use case - user-mandated 2026-10-08)

The user's refinement: "everything is dynamic / inside the context, but NOT understood dynamically - it's all pre-baked, pre-compiled and programmatically enhanced". The orchestration becomes a COMPILER, not a runtime chatter: the state flows; every context artifact is a COMPILED OUTPUT - deterministic, pre-generated, injected - the agents READ the baked blocks and NEVER reason about the batch state.

### 7.1 The compiler (the orchestration layer's core)

The plugin + the parent's deterministic rules form a compiler with pure functions:

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

- EVERY block the agents receive is a COMPILED OUTPUT - the LLM's only role is to READ it and act. The batch state is never described ad-hoc by any agent; the compiler owns the exact wording.
- The RE-COMPILE triggers: the state changes (setTask/setStatus) recompile the affected blocks - the TOC + the scopes + the gates - and re-inject them (the same slots, replaced). "Dynamic" = the state flows; "pre-baked" = the compilation is deterministic + programmatic - zero reasoning about the batch by anyone.

### 7.2 The programmatic enhancements (what the compiler computes BEYOND the visible state)

1. THE FILE-OWNERSHIP MATRIX: the compiler computes every lane's surface set + the pairwise overlaps - the Scope blocks are generated from the matrix (a lane's block says exactly: "YOURS: <files> - SHARED WITH <lane> (read-before-edit): <files> - OFF-LIMITS: <files>") - the conflict avoidance becomes pre-baked, not negotiated.
2. THE GATE TRUTH: the compiler tracks the arbiter states (the site build, the smokes) - the Gates block tells every lane "THE TREE IS GREEN" or "THE TREE IS RED: <the lane's in-flight edit broke <file>>" - the programmatic truth, computed from the actual runs (the plugin runs/observes the gates), never the agents' claims.
3. THE QUEUE PROJECTION: the compiled schedule (the current pair, the next pairs, the priorities - the deterministic rules: the surfaces' disjointness, the dependencies) - the lanes see their future slots pre-baked.
4. THE REPORT AGGREGATION: the completion reports feed the state - the compiler aggregates the results into the next blocks (the "X lane landed: <summary>" lines in the TOC) - the parent's manual reporting becomes the compiled delta.
5. THE CONTEXT-BUDGET CONTROL: every block is size-bounded (the compact TOC + the scope + the gates - never the histories) - the constant-state-slot guarantee: the context's state portion never grows, regardless of the batch's duration.
6. THE PROMPT COMPILATION: the parent's activations/amendments become TEMPLATES the compiler fills (the task + the state block + the disciplines - generated, not hand-written) - the message-writing is programmatic; the parent reviews the compiled prompts instead of composing them.

### 7.3 The most advanced case usage (the full picture)

- THE WHOLE-FAMILY ORCHESTRATION: the plugin serves EVERY batch (the DeepSeek site, the family packages, the future Aphrodite session) - one state store, the compiled blocks per batch; the multi-project sessions share the plugin, isolated by the batch keys.
- THE IDLE-AGENT LIFECYCLE, PRE-BAKED: the idle agents' specs are the compiled artifacts; the activation = the compiler injects the compiled activation block (the task + the state + the scope) - the parent's manual message-writing is replaced by the compiler's output (the parent confirms, the plugin generates).
- THE AUTO-SCOPING: the file-ownership matrix makes the "stay in scope" discipline PROGRAMMATIC - the compiled Scope blocks eliminate the surface fights (the Line-break unclosed-<p> class of incident becomes structurally impossible: the compiler's per-file ownership + the gates' red-flagging catch the breakage at the first state change).
- THE GATE-DRIVEN QUEUE: the queue advances on the compiled gate truth (a lane cannot complete until its gates are green - the state machine enforces it - the "build-verified after every file" rule becomes the plugin's state transition, not the prompt's advice).
- THE REPORT LOOP: every lane's completion recompiles the TOC + the queue - the batch becomes a closed loop: State -> Compile -> Inject -> Act -> Report -> State.

### 7.4 The implementation deltas (beyond the base plan)

- The compiler module (pure functions per 7.1) - the TOC/Scope/Prompt/Queue/Gates generators.
- The file-ownership registry (fed by the parent's scope declarations at the activations - the compiler derives the matrix).
- The gate observer (the plugin runs/observes the build + the smokes - the Gates block from the actual exit codes).
- The prompt templates (the compiled activations - the parent's confirm flow).
- The multi-batch support (the batch keys + the isolated state).
- The probe's scope extended: the inbox-replacement mechanics (does the splice replace the prior block? the fallback: the compiled blocks written to the state file - the agents read the baked file).

### 7.5 The user's model, confirmed

OLD: BLOCK, BLOCK, BLOCK, NEW BLOCKS (the state descriptions accumulate in the history - repetitive, stale).
NEW: DYNAMIC BLOCK (recompiled + replaced on every send - constant size, never extending the conversation) + BLOCK, BLOCK, BLOCK, NEW BLOCKS.
And the refinement: the DYNAMIC BLOCK is not "understood" - it is COMPILED: the pre-baked outputs of the deterministic orchestration compiler, injected programmatically, read mechanically by the agents - "a context becomes a function of this co-operative approach": Context = Compile(State).
