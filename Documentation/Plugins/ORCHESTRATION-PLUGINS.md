---
title: The orchestration plugin family (built as PoCs, 2026-10-22)
category: Plugins
kind: living-record
date: 2026-10-22
status: active
registry: Documentation/Plugins/ORCHESTRATION-PLUGINS.md
index: Documentation/INDEX.md
statuses:
    - name:
          the built members (BATCH-STATE / ROUTING-ENFORCER / SUBAGENT-QUEUE / HONEST-FEEDBACK /
          GITGUARD, plus PASS-ON / INGESTER / PATTERN / BATCH-DECISION)
      state: implemented (PoC)
      evidence:
          the packages under Classic/packages/ (plugin-dsh-batchstate, plugin-dsh-route,
          plugin-dsh-queue, plugin-dsh-feedback, plugin-dsh-gitguard, plugin-dsh-pass-on,
          plugin-dsh-ingester, plugin-dsh-pattern, hook-dsh-batch-decision) with their ETS twins
          where declared; the grades in Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the working mechanism for now (the skills)
      state: implemented
      evidence:
          Documentation/Skill - the idle-agent-protocol, orchestrator-batch, task-routing,
          worker-strains family
---

# ORCHESTRATION-PLUGINS - the orchestration plugin family (built as PoCs, 2026-10-22)

> **Status: BUILT AS POCs (2026-10-22).** Every member below now has a package in
> `Classic/packages/` (with ETS twins where the manifest declares them) - not just documents. The
> design text below stays as the record of intent; the PoC-vs-plan grades (what a PoC covers and
> what remains) are the truth: Documentation/Reports/POC-GAP-ANALYSIS.md. The per-plugin live test
> plans: Documentation/Testing/. The working mechanism alongside is still the skills
> (Documentation/Skill/ - the idle-agent-protocol, orchestrator-batch, task-routing, worker-strains
> family). Source of truth: Documentation/Plans/BATCH-STATE-PLUGIN.md, ROUTING-ENFORCER-PLUGIN.md,
> SUBAGENT-QUEUE-PLUGIN.md, ORCHESTRATION-FAMILY.md, HONEST-FEEDBACK-PLUGIN.md.

## 0. The user's mandate (why this family)

Think of the plugin family as an INTEGRATED MESSAGE BUS.

Disperse the information with the blocks + the active communication/programming paradigms already in
place - FIFO/LIFO queues + parentage combined in different ways + maximal utilization into dynamic
"workflows" (a conversation is ONE such workflow).

Keep the members' functionality SEPARATE.

Combine their effectuallity in the eventuallity of the system.

When a conversation runs, the members activate invisibly (the user + the orchestrator don't see
them) - the COUNCIL HUB is activated, ALWAYS pertaining knowledge per session.

The TRIBE system (conversation + n members + a leader) comes later, on the council's foundation.

## 1. The four members (built 2026-10-22, plus the four supporting candidates)

| Member             | Package                                                          | One-line function                                                  | The paradigm it realizes | Status      |
| ------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------ | ----------- |
| BATCH-STATE        | `@playform/plugin-dsh-batchstate`                                | the compiled context (the pre-baked TOC/Scope/Gates)               | the SHARED STATE         | built (PoC) |
| ROUTING-ENFORCER   | `@playform/plugin-dsh-route`                                     | the silent auto-routing (the user's policy is the law)             | the POLICY               | built (PoC) |
| SUBAGENT-QUEUE     | `@playform/plugin-dsh-queue`                                     | the task queue + the capacity model (10 held / 2 children)         | the QUEUES               | built (PoC) |
| HONEST-FEEDBACK    | `@playform/plugin-dsh-feedback`                                  | the honest signals (the liked/disliked blocks, transferred unread) | the FEEDBACK             | built (PoC) |
| GITGUARD           | `@playform/plugin-dsh-gitguard`                                  | classify and deny dangerous git commands                           | the CANNOT               | built (PoC) |
| PASS-ON / INGESTER | `@playform/plugin-dsh-pass-on` / `@playform/plugin-dsh-ingester` | the proposal handoff for the batch flow                            | the HANDOFF              | built (PoC) |
| PATTERN            | `@playform/plugin-dsh-pattern`                                   | match/record/decay the learned patterns                            | the MEMORY               | built (PoC) |
| BATCH-DECISION     | `@playform/hook-dsh-batch-decision`                              | the conservative auto-approve policy + the decision tool           | the GATE                 | built (PoC) |

Each member's PoC grade (what the PoC covers, what remains toward the full plan):
Documentation/Reports/POC-GAP-ANALYSIS.md.

### 1.1 BATCH-STATE (`@playform/plugin-dsh-batchstate`)

- **Problem it solves:** the batch state lives ONLY in the parent's manual messages. The messages
  are repetitive and stale, and EACH agent's context is NOT a function of the cooperative state.
  Behavioral discipline (the skills) can slip. Live awareness must be programmatic.
- **Purpose:** a live state store plus a pre-baked, deterministic CONTEXT COMPILER. The state store
  holds EACH agent's id, role, CURRENT activity - NOT the initial spec - status
  idle/active/completed/failed/interrupted, queue position, scope. The compiler:
  `Context(agent, t) = Compile( TOC | Scope(agent) | Gates | Queue ) + H(agent)`. EVERY block the
  agents receive is a compiled output. The LLM's ONLY role is to READ it and act. The output is
  recompiled and re-injected IN PLACE on EVERY state change. The constant-state-slot guarantee:
  replaced, NEVER accumulated.
- **Trigger surface:** the state-change events (`setTask` / `setStatus` / `setScope` service writes
  from the parent and the agents' phase reports). The splice rides the agent-loop's inbox projection
  (`agent/inbox/spliced` - the harness mechanism the session records prove). Fallback: a well-known
  state file the agents read.
- **Programmatic enhancements beyond visible state:** the file-ownership matrix (compiled Scope
  blocks - the surface fights become structurally impossible). The gate truth (the arbiter's
  build/smoke states from actual runs, NEVER the agents' claims). The queue projection, the report
  aggregation, the context budgets, the prompt compilation.
- **Rules:** the block is read-only, compact, clearly delimited. The family's ledger conventions
  apply. The user's override wins.

### 1.2 ROUTING-ENFORCER (`@playform/plugin-dsh-route`)

- **Problem it solves (the incident):** the task-routing skill mandates ALWAYS passing
  provider/model/reasoningEffort explicitly. The orchestrator applied it to ONE wave then SLIPPED
  back to the omission (which inherits the parent's expensive route). Behavior CAN slip - prevention
  must be systemic + SILENT.
- **Purpose:** a deterministic pure resolver
  `Routing(launchRequest, UserPolicy) -> { provider, model, reasoningEffort }`. When a launch omits
  the route, the plugin resolves it per the user's policy and INJECTS it silently - NO warning, NO
  reminder. The orchestrator is NOT even bothered. Explicit-but-wrong launches are corrected
  silently per the policy and logged to the ledger. The ESCALATION ladder (GLM attempts -> DeepSeek
  max with the artifacts, at most ONCE) is also automatic + silent. Current policy anchor: EVERY
  subagent = cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash / reasoningEffort low.
- **Trigger surface:** the subagent launch path (the agent-loop's territory - the plugin extends or
  rides it; the same probe as the siblings). The inputs are the launch request + the user's policy
  config in ~/.dsh (read-only - the plugin NEVER writes the policy). The user's configuration is the
  law.
- **Rules:** the routing ledger (the launch, the task type, the resolved route, the
  explicit-or-resolved / corrected-or-kept flags) feeds the BATCH-STATE compiler's Gates. Task-type
  inference is keyword-table based with the policy as final authority.

### 1.3 SUBAGENT-QUEUE (`@playform/plugin-dsh-queue`)

- **Problem it solves:** the IDLE pattern holds agent + spec in the conversation (context-costly,
  slot-bound). The harness's active-child cap serialized the parallel dispatch. Tasks should be
  QUEUED as data, agents spawned at dispatch time.
- **Purpose:** a queue store plus a dispatcher enforcing the user's capacity model. The queue store
  holds the task as data: id, self-contained spec, role for routing, priority + dependencies, state
  queued -> dispatched -> running -> completed/failed/interrupted, result hash. The dispatcher
  enforces the capacity model: the main conversation holds up to 10 subagents (the IDLE-held pool
  reservation), EACH agent's own child fan-out capped at 2. When a slot frees, the next task
  spawns - routed per the policy, silently.
- **Trigger surface:** the orchestrator's queue calls (enqueue tasks). The pool/reservation surface
  (the per-root-lineage pool, `maxActiveSubagents` as the backstop knob - the shared probe).
  Slot-free events (a child settling to IDLE releases its active slot - the harness fact).
- **Rules:** the dispatcher ONLY schedules (NEVER alters a spec). The queue state is part of the
  batch state (compiled into the TOC's QUEUE line). IDLE coexistence - the reserved slots and the
  queue's pending coexist. The orchestrator chooses per task.

### 1.4 HONEST-FEEDBACK (`@playform/plugin-dsh-feedback`)

- **Problem it solves:** the agents' genuine signals (likes/dislikes, frictions) vanish inside
  polite completion reports. Nothing flows them up the lineage mechanically.
- **Purpose:** EVERY agent's completion carries an HONEST feedback footer (LIKED / DISLIKED / DELTAS
  / TRANSFERRED / READ-STATUS). The footer is written to a per-session feedback journal and
  TRANSFERRED THROUGH THE PARENTAGE mechanically - child -> parent -> grandparent. It is ALWAYS
  modified in the parent sessions. The parents append deltas, NEVER sanitize, NEVER filter - the
  honest content survives the chain. The transfer NEVER force-reads. The recipient chooses to know /
  disknow. The read-status is recorded.
- **Trigger surface:** task completions (the queue's dispatcher attaches the footer). The
  session/parentage machinery (the same inbox/session probe as BATCH-STATE). `feedback/push` /
  `feedback/read` / `feedback/summary` service methods. `feedback/journal` for the user's review
  surface.
- **Rules:** part of the council hub's per-session knowledge. The signals are the raw material for
  the future TRIBE system (conversation + n members + a leader).

## 2. The shared probe (one investigation, three consumers)

ALL three implementation investigations share the same probe phase. Do it ONCE:

1. **The inbox.**

    The harness's inbox/session mechanics (`agent/inbox/spliced` - BATCH-STATE's splice +
    HONEST-FEEDBACK's transfer).

2. **The pool.**

    The pool/reservation surface (the per-root-lineage pool, `maxActiveSubagents` - SUBAGENT-QUEUE's
    capacity + ROUTING-ENFORCER's launch path).

3. **The config.**

    The config application (the patch-load at startup + the volatile settings).

## 3. The git-mutation guard (built as `@playform/plugin-dsh-gitguard`)

- **Problem it solves (the live slip):** the orchestrator committed `23a313d` and `c920617` and ran
  `git rm` during a session close-out. The git checks-only law now lives in the skills
  (code-authoring section 1d, user-mandated 2026-10-10) - but skills are behavioral and CAN slip,
  exactly like the routing discipline. The proposed fifth member is now BUILT:
  `@playform/plugin-dsh-gitguard` (with its `ets-plugin-dsh-gitguard` twin).
- **Purpose:** a tools/pre-execute DENY-LIST on the terminal/exec tool surface. It intercepts
  terminal commands before execution. It denies ANY git mutation pattern - `git add`, `git commit`,
  `git reset`, `git push`, `git tag`, `git rm`, `git checkout/branch/merge/stash`, `git clean` -
  while ALLOWING the read-only checks (`git status`, `log`, `diff`, `show`, `rev-parse`, `ls-files`,
  `--diff-filter=D`, `fetch`). Denials surface ONCE (the tool result), NEVER punish. The agent's
  correct path is simply the ONLY executable one.
- **Trigger surface:** the terminal/exec tool's pre-execute hook (the same pre-execute surface the
  normalize family's mutation gating uses for file writes). Optionally a post-execute ledger line
  per denied attempt (`~/.dsh/hook-dsh-gitguard.log`) for the user's audit.
- **Config keys (proposed, family conventions):** `log`/`logFile`, `denyPatterns` (the default list
  above), `allowPatterns` (the checks + `fetch`), `strict` (deny ALL git commands vs deny-list
  only - default deny-list), `exclude` (paths the guard ignores).
- **Why pre-execute deny-list:** the same defaults-off-but-enforced design as the family's gates.
  The skill carries the WHY. The plugin carries the CANNOT. It mirrors ROUTING-ENFORCER's
  philosophy: systemic + silent prevention of a discipline that slips.

## 4. The combined effectuallity (the council hub)

- The members share the primitives: the BLOCKS (the batch-state compiles them, the queue dispatches
  them, the routing resolves them, the feedback appends them), the QUEUES (FIFO/LIFO + parentage),
  the EVENTS (the state changes, the completions, the signals).
- The underwriting equation (ORCHESTRATION-FAMILY.md section 8):
  `Context(a,t) = Compile( S(t) + Q(t) + R(a,t) + F(t) + Scope(a) ) + H(a,t)`.
  `Council(t) = { S, Q, R, F }`. The 14-row combination space (state drives the dispatch, the queue
  as a state dimension, the routes in the gates, the feedback loops into the policy review, the
  parentage composes EVERY member).
- The sphere compaction (section 9): tool calls OVERWRITE the outer surface. The context blocks are
  the MIDDLE layer (permissioned sub-blocks - TOC/Scope/Gates/Routing/Queue/Feedback/Policy,
  filtered per tool, per model family, per plugin behavior at COMPILE time). The behaviors
  UNDERWRITE the inner generators. Volume held: the state slot replaced, the blocks bounded.
- Implementation order (the probe first, then the members - DELIVERED as PoCs 2026-10-22 in this
  order): the shared probe, BATCH-STATE (the skeleton the others integrate into), ROUTING-ENFORCER +
  SUBAGENT-QUEUE (dispatch + routes), HONEST-FEEDBACK, the git-mutation guard, then the batch-flow
  handoff (PASS-ON / INGESTER / BATCH-DECISION) and the PATTERN memory. EVERY member: the loader
  contract (name/apply/Config/inject), the family's ledger conventions, the smokes as the arbiter,
  the no-commit regime (READY-TO-COMMIT reporting).
