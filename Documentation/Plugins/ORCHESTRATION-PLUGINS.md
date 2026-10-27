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
> `Classic/packages/` (with ETS twins where the manifest declares them), not just documents.
>
> The design text below stays as the record of intent, and the PoC-vs-plan grades (what a PoC covers
> and what remains) are the truth: Documentation/Reports/POC-GAP-ANALYSIS.md.
>
> The per-plugin live test plans are in Documentation/Testing/.
>
> The working mechanism alongside is still the skills (Documentation/Skill/ - the
> idle-agent-protocol, orchestrator-batch, task-routing, worker-strains family).
>
> The source of truth is Documentation/Plans/BATCH-STATE-PLUGIN.md, ROUTING-ENFORCER-PLUGIN.md,
> SUBAGENT-QUEUE-PLUGIN.md, ORCHESTRATION-FAMILY.md, and HONEST-FEEDBACK-PLUGIN.md.

## 0. The user's mandate (why this family)

Think of the plugin family as an INTEGRATED MESSAGE BUS.

Disperse the information with the blocks and the active communication/programming paradigms already
in place - FIFO/LIFO queues + parentage combined in different ways + maximal utilization into
dynamic "workflows" (a conversation is ONE such workflow).

Keep the members' functionality SEPARATE.

Combine their effectuallity in the eventuallity of the system.

When a conversation runs, the members activate invisibly (the user + the orchestrator don't see
them), and the COUNCIL HUB is activated, ALWAYS pertaining knowledge per session.

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

The PoC grade of each member (what the PoC covers and what remains toward the full plan) is in
Documentation/Reports/POC-GAP-ANALYSIS.md.

### 1.1 BATCH-STATE (`@playform/plugin-dsh-batchstate`)

- **Problem it solves:** the batch state lives ONLY in the manual messages of the parent, those
  messages are repetitive and stale, EACH agent's context is NOT a function of the cooperative
  state, behavioral discipline (the skills) can slip, and live awareness must be programmatic.
- **Purpose:** a live state store plus a pre-baked, deterministic CONTEXT COMPILER, where the state
  store holds EACH agent's id, role, CURRENT activity (NOT the initial spec), status
  idle/active/completed/failed/interrupted, queue position, and scope, and the compiler is
  `Context(agent, t) = Compile( TOC | Scope(agent) | Gates | Queue ) + H(agent)`; EVERY block that
  the agents receive is a compiled output, the ONLY role of the LLM is to READ it and act, the
  output is recompiled and re-injected IN PLACE on EVERY state change, and the constant-state-slot
  guarantee is replaced, NEVER accumulated.
- **Trigger surface:** the state-change events (`setTask` / `setStatus` / `setScope` service writes
  from the parent and the phase reports of the agents), where the splice rides the inbox projection
  of the agent loop (`agent/inbox/spliced`, the harness mechanism that the session records prove)
  and the fallback is a well-known state file that the agents read.
- **Programmatic enhancements beyond visible state:** the file-ownership matrix (compiled Scope
  blocks, so the surface fights become structurally impossible), the gate truth (the build and smoke
  states of the arbiter from actual runs, NEVER the claims of the agents), and the queue projection,
  the report aggregation, the context budgets, and the prompt compilation.
- **Rules:** the block is read-only, compact, and clearly delimited, the ledger conventions of the
  family apply, and the override of the user wins.

### 1.2 ROUTING-ENFORCER (`@playform/plugin-dsh-route`)

- **Problem it solves (the incident):** the task-routing skill mandates ALWAYS passing
  provider/model/reasoningEffort explicitly, the orchestrator applied it to ONE wave and then
  SLIPPED back to the omission (which inherits the expensive route of the parent), and behavior CAN
  slip, so prevention must be systemic and SILENT.
- **Purpose:** a deterministic pure resolver
  `Routing(launchRequest, UserPolicy) -> { provider, model, reasoningEffort }`, where a launch that
  omits the route makes the plugin resolve it per the policy of the user and INJECT it silently (NO
  warning, NO reminder), the orchestrator is NOT even bothered, explicit-but-wrong launches are
  corrected silently per the policy and logged to the ledger, and the ESCALATION ladder (GLM
  attempts -> DeepSeek max with the artifacts, at most ONCE) is also automatic and silent, with the
  current policy anchor EVERY subagent = cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash /
  reasoningEffort low.
- **Trigger surface:** the subagent launch path (the territory of the agent loop, which the plugin
  extends or rides with the same probe as the siblings), where the inputs are the launch request and
  the policy config of the user in ~/.dsh (read-only, because the plugin NEVER writes the policy)
  and the configuration of the user is the law.
- **Rules:** the routing ledger (the launch, the task type, the resolved route, and the
  explicit-or-resolved / corrected-or-kept flags) feeds the Gates of the BATCH-STATE compiler, and
  task-type inference works from a keyword table with the policy as final authority.

### 1.3 SUBAGENT-QUEUE (`@playform/plugin-dsh-queue`)

- **Problem it solves:** the IDLE pattern holds agent + spec in the conversation (context-costly and
  slot-bound), the active-child cap of the harness serialized the parallel dispatch, and tasks
  should be QUEUED as data with agents spawned at dispatch time.
- **Purpose:** a queue store plus a dispatcher that enforces the capacity model of the user, where
  the queue store holds the task as data (id, self-contained spec, role for routing, priority +
  dependencies, state queued -> dispatched -> running -> completed/failed/interrupted, and result
  hash) and the dispatcher enforces the capacity model (the main conversation holds up to 10
  subagents as the IDLE-held pool reservation, and EACH agent's own child fan-out is capped at 2),
  so when a slot frees, the next task spawns, routed per the policy and silently.
- **Trigger surface:** the queue calls of the orchestrator (enqueue tasks), the pool/reservation
  surface (the per-root-lineage pool with `maxActiveSubagents` as the backstop knob, the shared
  probe), and the slot-free events (a child that settles to IDLE releases its active slot, the
  harness fact).
- **Rules:** the dispatcher ONLY schedules and NEVER alters a spec, the queue state is part of the
  batch state (compiled into the QUEUE line of the TOC), and IDLE coexistence holds the reserved
  slots and the pending queue together while the orchestrator chooses per task.

### 1.4 HONEST-FEEDBACK (`@playform/plugin-dsh-feedback`)

- **Problem it solves:** the genuine signals of the agents (likes/dislikes, frictions) vanish inside
  polite completion reports, and nothing flows them up the lineage mechanically.
- **Purpose:** EVERY completion of an agent carries an HONEST feedback footer (LIKED / DISLIKED /
  DELTAS / TRANSFERRED / READ-STATUS), the footer is written to a per-session feedback journal and
  TRANSFERRED THROUGH THE PARENTAGE mechanically (child -> parent -> grandparent), it is ALWAYS
  modified in the parent sessions, the parents append deltas and NEVER sanitize or filter so the
  honest content survives the chain, and the transfer NEVER force-reads, because the recipient
  chooses to know or disknow and the read-status is recorded.
- **Trigger surface:** task completions (the dispatcher of the queue attaches the footer), the
  session/parentage machinery (the same inbox/session probe as BATCH-STATE), the `feedback/push` /
  `feedback/read` / `feedback/summary` service methods, and `feedback/journal` for the review
  surface of the user.
- **Rules:** it is part of the per-session knowledge of the council hub, and the signals are the raw
  material for the future TRIBE system (conversation + n members + a leader).

## 2. The shared probe (one investigation, three consumers)

ALL three implementation investigations share the same probe phase, so do it ONCE:

1. **The inbox.**

    The inbox and session mechanics of the harness (`agent/inbox/spliced`, which is the splice of
    BATCH-STATE and the transfer of HONEST-FEEDBACK).

2. **The pool.**

    The pool/reservation surface (the per-root-lineage pool, `maxActiveSubagents`, which is the
    capacity of SUBAGENT-QUEUE and the launch path of ROUTING-ENFORCER).

3. **The config.**

    The application of the config (the patch load at startup and the volatile settings).

## 3. The git-mutation guard (built as `@playform/plugin-dsh-gitguard`)

- **Problem it solves (the live slip):** the orchestrator committed `23a313d` and `c920617` and ran
  `git rm` during a session close-out, the git checks-only law now lives in the skills
  (code-authoring section 1d, user-mandated 2026-10-10), but skills are behavioral and CAN slip
  exactly like the routing discipline, so the proposed fifth member is now BUILT as
  `@playform/plugin-dsh-gitguard` (with its `ets-plugin-dsh-gitguard` twin).
- **Purpose:** a tools/pre-execute DENY-LIST on the terminal/exec tool surface, which intercepts
  terminal commands before execution and denies ANY git mutation pattern (`git add`, `git commit`,
  `git reset`, `git push`, `git tag`, `git rm`, `git checkout/branch/merge/stash`, `git clean`)
  while ALLOWING the read-only checks (`git status`, `log`, `diff`, `show`, `rev-parse`, `ls-files`,
  `--diff-filter=D`, `fetch`), where denials surface ONCE (the tool result) and NEVER punish and the
  correct path of the agent is simply the ONLY executable one.
- **Trigger surface:** the pre-execute hook of the terminal/exec tool (the same pre-execute surface
  that the mutation gating of the normalize family uses for file writes), with an optional
  post-execute ledger line per denied attempt (`~/.dsh/hook-dsh-gitguard.log`) for the audit of the
  user.
- **Config keys (proposed, family conventions):** `log`/`logFile`, `denyPatterns` (the default list
  above), `allowPatterns` (the checks + `fetch`), `strict` (deny ALL git commands vs deny-list only,
  with deny-list as the default), and `exclude` (paths that the guard ignores).
- **Why pre-execute deny-list:** the same defaults-off-but-enforced design as the gates of the
  family, where the skill carries the WHY and the plugin carries the CANNOT, which mirrors the
  philosophy of ROUTING-ENFORCER: systemic and silent prevention of a discipline that slips.

## 4. The combined effectuallity (the council hub)

- The members share the primitives: the BLOCKS (the batch-state compiles them, the queue dispatches
  them, the routing resolves them, and the feedback appends them), the QUEUES (FIFO/LIFO +
  parentage), and the EVENTS (the state changes, the completions, and the signals).
- The underwriting equation (ORCHESTRATION-FAMILY.md section 8):
  `Context(a,t) = Compile( S(t) + Q(t) + R(a,t) + F(t) + Scope(a) ) + H(a,t)`.
  `Council(t) = { S, Q, R, F }`, and the 14-row combination space covers state driving the dispatch,
  the queue as a state dimension, the routes in the gates, the feedback loops into the policy
  review, and the parentage composing EVERY member.
- The sphere compaction (section 9) makes tool calls OVERWRITE the outer surface, keeps the context
  blocks as the MIDDLE layer (permissioned sub-blocks -
  TOC/Scope/Gates/Routing/Queue/Feedback/Policy, filtered per tool, per model family, and per plugin
  behavior at COMPILE time), and makes the behaviors UNDERWRITE the inner generators, with the
  volume held (the state slot replaced and the blocks bounded).
- Implementation order (the probe first, then the members - DELIVERED as PoCs 2026-10-22 in this
  order) is the shared probe, BATCH-STATE (the skeleton the others integrate into), ROUTING-ENFORCER
    - SUBAGENT-QUEUE (dispatch + routes), HONEST-FEEDBACK, the git-mutation guard, then the
      batch-flow handoff (PASS-ON / INGESTER / BATCH-DECISION) and the PATTERN memory, where EVERY
      member has the loader contract (name/apply/Config/inject), the ledger conventions of the
      family, the smokes as the arbiter, and the no-commit regime (READY-TO-COMMIT reporting).
