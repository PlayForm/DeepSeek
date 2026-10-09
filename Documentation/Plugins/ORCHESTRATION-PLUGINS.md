# ORCHESTRATION-PLUGINS - the planned orchestration plugin family, as documents

> **Status: PLANNED - documents only.** Nothing here is implemented, scaffolded,
> or packaged. These are the "plugins saved as documents": each section records
> a future plugin's purpose, trigger surface, and the problem it solves, so a
> later session can implement them without re-deriving the intent. The working
> mechanism for NOW is the skills (Documentation/Skill/ - the idle-agent-protocol,
> orchestrator-batch, task-routing, worker-strains family). Source of truth:
> Documentation/Plans/BATCH-STATE-PLUGIN.md, ROUTING-ENFORCER-PLUGIN.md,
> SUBAGENT-QUEUE-PLUGIN.md, ORCHESTRATION-FAMILY.md, HONEST-FEEDBACK-PLUGIN.md.

## 0. The user's mandate (why this family)

Think of the plugin family as an INTEGRATED MESSAGE BUS: disperse the
information with the blocks + the active communication/programming paradigms
already in place - FIFO/LIFO queues + parentage combined in different ways +
maximal utilization into dynamic "workflows" (a conversation is one such
workflow). Keep the members' functionality SEPARATE; combine their effectuallity
in the eventuallity of the system. When a conversation runs, the members
activate invisibly (the user + the orchestrator don't see them) - the COUNCIL
HUB is activated, always pertaining knowledge per session. The TRIBE system
(conversation + n members + a leader) comes later, on the council's foundation.

## 1. The four planned members

| Member | Planned package name | One-line function | The paradigm it realizes |
|---|---|---|---|
| BATCH-STATE | `@playform/plugin-dsh-batchstate` | the compiled context (the pre-baked TOC/Scope/Gates) | the SHARED STATE |
| ROUTING-ENFORCER | `@playform/plugin-dsh-route` | the silent auto-routing (the user's policy is the law) | the POLICY |
| SUBAGENT-QUEUE | `@playform/plugin-dsh-queue` | the task queue + the capacity model (10 held / 2 children) | the QUEUES |
| HONEST-FEEDBACK | `@playform/plugin-dsh-feedback` | the honest signals (the liked/disliked blocks, transferred unread) | the FEEDBACK |

### 1.1 BATCH-STATE (`@playform/plugin-dsh-batchstate`)

- **Problem it solves:** the batch state lives only in the parent's manual
  messages - repetitive, stale, and each agent's context is NOT a function of
  the cooperative state. Behavioral discipline (the skills) can slip; live
  awareness must be programmatic.
- **Purpose:** a live state store (each agent's id, role, CURRENT activity -
  not the initial spec - status idle/active/completed/failed/interrupted, queue
  position, scope) plus a pre-baked, deterministic CONTEXT COMPILER:
  `Context(agent, t) = Compile( TOC | Scope(agent) | Gates | Queue ) + H(agent)`.
  Every block the agents receive is a compiled output - the LLM's only role is
  to READ it and act. Recompiled and re-injected in place on every state change
  (the constant-state-slot guarantee: replaced, never accumulated).
- **Trigger surface:** the state-change events (`setTask` / `setStatus` /
  `setScope` service writes from the parent and the agents' phase reports); the
  splice rides the agent-loop's inbox projection (`agent/inbox/spliced` - the
  harness mechanism the session records prove). Fallback: a well-known state
  file the agents read.
- **Programmatic enhancements beyond visible state:** the file-ownership matrix
  (compiled Scope blocks - the surface fights become structurally impossible),
  the gate truth (the arbiter's build/smoke states from actual runs, never the
  agents' claims), the queue projection, the report aggregation, the context
  budgets, the prompt compilation.
- **Rules:** the block is read-only, compact, clearly delimited; the family's
  ledger conventions; the user's override wins.

### 1.2 ROUTING-ENFORCER (`@playform/plugin-dsh-route`)

- **Problem it solves (the incident):** the task-routing skill mandates always
  passing provider/model/reasoningEffort explicitly; the orchestrator applied it
  to one wave then SLIPPED back to the omission (which inherits the parent's
  expensive route). Behavior CAN slip - prevention must be systemic + SILENT.
- **Purpose:** a deterministic pure resolver
  `Routing(launchRequest, UserPolicy) -> { provider, model, reasoningEffort }`.
  When a launch omits the route, the plugin resolves it per the user's policy
  and INJECTS it silently - no warning, no reminder; the orchestrator is not
  even bothered. Explicit-but-wrong launches are corrected silently per the
  policy and logged to the ledger. The ESCALATION ladder (GLM attempts ->
  DeepSeek max with the artifacts, at most once) is also automatic + silent.
  Current policy anchor: every subagent =
  cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash / reasoningEffort low.
- **Trigger surface:** the subagent launch path (the agent-loop's territory -
  the plugin extends or rides it; the same probe as the siblings); the launch
  request + the user's policy config in ~/.dsh (read-only - the plugin never
  writes the policy; the user's configuration is the law).
- **Rules:** the routing ledger (the launch, the task type, the resolved route,
  the explicit-or-resolved / corrected-or-kept flags) feeds the BATCH-STATE
  compiler's Gates; keyword-table task-type inference with the policy as final
  authority.

### 1.3 SUBAGENT-QUEUE (`@playform/plugin-dsh-queue`)

- **Problem it solves:** the IDLE pattern holds agent + spec in the conversation
  (context-costly, slot-bound), and the harness's active-child cap serialized
  the parallel dispatch. Tasks should be QUEUED as data, agents spawned at
  dispatch time.
- **Purpose:** a queue store (the task as data: id, self-contained spec, role
  for routing, priority + dependencies, state queued -> dispatched -> running ->
  completed/failed/interrupted, result hash) plus a dispatcher enforcing the
  user's capacity model: the main conversation holds up to 10 subagents (the
  IDLE-held pool reservation), each agent's own child fan-out capped at 2. When
  a slot frees, the next task spawns - routed per the policy, silently.
- **Trigger surface:** the orchestrator's queue calls (enqueue tasks); the
  pool/reservation surface (the per-root-lineage pool, `maxActiveSubagents` as
  the backstop knob - the shared probe); slot-free events (a child settling to
  IDLE releases its active slot - the harness fact).
- **Rules:** the dispatcher only schedules (never alters a spec); the queue
  state is part of the batch state (compiled into the TOC's QUEUE line); IDLE
  coexistence - the reserved slots and the queue's pending coexist, the
  orchestrator chooses per task.

### 1.4 HONEST-FEEDBACK (`@playform/plugin-dsh-feedback`)

- **Problem it solves:** the agents' genuine signals (likes/dislikes, frictions)
  vanish inside polite completion reports; nothing flows them up the lineage
  mechanically.
- **Purpose:** every agent's completion carries an HONEST feedback footer
  (LIKED / DISLIKED / DELTAS / TRANSFERRED / READ-STATUS), written to a
  per-session feedback journal and TRANSFERRED THROUGH THE PARENTAGE
  mechanically - child -> parent -> grandparent, always modified in the parent
  sessions (the parents append deltas, never sanitize, never filter - the honest
  content survives the chain). The transfer never force-reads: the recipient
  chooses to know / disknow; the read-status is recorded.
- **Trigger surface:** task completions (the queue's dispatcher attaches the
  footer); the session/parentage machinery (the same inbox/session probe as
  BATCH-STATE); `feedback/push` / `feedback/read` / `feedback/summary` service
  methods; `feedback/journal` for the user's review surface.
- **Rules:** part of the council hub's per-session knowledge; the signals are
  the raw material for the future TRIBE system (conversation + n members + a
  leader).

## 2. The shared probe (one investigation, three consumers)

All three implementation investigations share the same probe phase - do it once:

1. The harness's inbox/session mechanics (`agent/inbox/spliced` - BATCH-STATE's
   splice + HONEST-FEEDBACK's transfer).
2. The pool/reservation surface (the per-root-lineage pool, `maxActiveSubagents`
   - SUBAGENT-QUEUE's capacity + ROUTING-ENFORCER's launch path).
3. The config application (the patch-load at startup + the volatile settings).

## 3. PROPOSED: the git-mutation guard (from the 2026-10-10 lessons)

- **Problem it solves (the live slip):** the orchestrator committed `23a313d`
  and `c920617` and ran `git rm` during a session close-out. The git checks-only
  law now lives in the skills (code-authoring §1d, user-mandated 2026-10-10) -
  but skills are behavioral and CAN slip, exactly like the routing discipline.
  A proposed fifth member: `@playform/plugin-dsh-gitguard`.
- **Purpose:** a tools/pre-execute DENY-LIST on the terminal/exec tool surface:
  intercept terminal commands before execution and deny any git mutation pattern
  - `git add`, `git commit`, `git reset`, `git push`, `git tag`, `git rm`,
  `git checkout/branch/merge/stash`, `git clean` - while ALLOWING the read-only
  checks (`git status`, `log`, `diff`, `show`, `rev-parse`, `ls-files`,
  `--diff-filter=D`, `fetch`). Denials surface once (the tool result), never
  punish: the agent's correct path is simply the only executable one.
- **Trigger surface:** the terminal/exec tool's pre-execute hook (the same
  pre-execute surface the normalize family's mutation gating uses for file
  writes); optionally a post-execute ledger line per denied attempt
  (`~/.dsh/hook-dsh-gitguard.log`) for the user's audit.
- **Config keys (proposed, family conventions):** `log`/`logFile`,
  `denyPatterns` (the default list above), `allowPatterns` (the checks +
  `fetch`), `strict` (deny ALL git commands vs deny-list only - default
  deny-list), `exclude` (paths the guard ignores).
- **Why pre-execute deny-list:** the same defaults-off-but-enforced design as
  the family's gates - the skill carries the WHY, the plugin carries the
  CANNOT. Mirrors ROUTING-ENFORCER's philosophy: systemic + silent prevention
  of a discipline that slips.

## 4. The combined effectuallity (the council hub)

- The four (+ proposed fifth) members share the primitives: the BLOCKS (the
  batch-state compiles them, the queue dispatches them, the routing resolves
  them, the feedback appends them), the QUEUES (FIFO/LIFO + parentage), the
  EVENTS (the state changes, the completions, the signals).
- The underwriting equation (ORCHESTRATION-FAMILY.md §8):
  `Context(a,t) = Compile( S(t) + Q(t) + R(a,t) + F(t) + Scope(a) ) + H(a,t)`;
  `Council(t) = { S, Q, R, F }`; the 14-row combination space (state drives the
  dispatch, the queue as a state dimension, the routes in the gates, the
  feedback loops into the policy review, the parentage composes every member).
- The sphere compaction (§9): tool calls OVERWRITE the outer surface, the
  context blocks are the MIDDLE layer (permissioned sub-blocks - TOC/Scope/
  Gates/Routing/Queue/Feedback/Policy, filtered per tool, per model family, per
  plugin behavior at COMPILE time), the behaviors UNDERWRITE the inner
  generators. Volume held: the state slot replaced, the blocks bounded.
- Implementation order (all planned): the shared probe first, then BATCH-STATE
  (the skeleton the others integrate into), then ROUTING-ENFORCER +
  SUBAGENT-QUEUE (dispatch + routes), then HONEST-FEEDBACK, then - when the
  user approves - the git-mutation guard. Every member: the loader contract
  (name/apply/Config/inject), the family's ledger conventions, the smokes as
  the arbiter, the no-commit regime (READY-TO-COMMIT reporting).
