> Specialized working copy (repo): synced from ~/.dsh/skills/worker-strains/ on 2026-10-10, byte-faithful. This is the specialized truth for this monorepo's sessions; the global copy is the fallback. Sync future changes to BOTH.
---
name: worker-strains
description: THE consolidated GLOBAL manual for the worker strains and the delegation methodologies of this harness - the three strains (explorer / coder / planner), their models and efforts (the full routing policy lives in the task-routing skill - load BOTH before delegating), their cultivation rules, the idle-agent protocol, and the orchestrator-batch loop. Load before ANY delegation in ANY conversation, so the strains are always known and the methodologies always applied.
whenToUse: Mandatory before every subagent delegation, workflow launch, or model choice in ANY conversation - together with the task-routing skill. If you are about to delegate without knowing the strains (which model, which effort, which protocol), STOP and read this manual + the task-routing skill first.
---

# Worker Strains - Operating Manual (global)

This harness cultivates THREE worker strains. Every delegation picks a
strain first, then the model + effort per the task-routing policy. The
strains are the cultivation sites: each has its own operating conditions,
its own protocols, and its own failure handling. The user's explicit
override always wins.

## 1. The strains

| Strain | What it is for | Model (exact) | effort | Cultivation rules |
|---|---|---|---|---|
| EXPLORER | read-only surveys, research, analysis, scans, archaeology | `@cf/zai-org/glm-5.3-flash` | `low` ALWAYS | low is always the answer; ONE high re-run allowed only when exploration feeds a coding task and came back unusably thin; `max` only on an explicit "archaeology" request; downstream validation is free (deterministic shell checks) so later stages correct mistakes |
| CODER | implementation, refactors, multi-file features, integration | `@cf/zai-org/glm-5.3-flash` | `high` (routine) / `low` (trivial, single-file, fully specified) | the attempts ladder: GLM high -> GLM high again -> escalate ONCE to DeepSeek max with the failed run's artifacts + a failure summary; the subagent ends failures with the `ESCALATION: <concrete reason>` marker; if the escalated run also fails, STOP + report both summaries to the user, never loop |
| PLANNER | planning, architecture, design, advanced debugging, the deepest reasoning | `@cf/deepseek-ai/deepseek-v4-flash-0731` | `max` | the main agent itself runs this lane (agent-default-model) - planning tasks are NEVER delegated to a GLM flash-tier model |

Allowed models (exactly these two - never invent others):
`@cf/zai-org/glm-5.3-flash` and `@cf/deepseek-ai/deepseek-v4-flash-0731`
(provider: `cloudflare-workers-ai`; reasoning_effort values: `low` |
`high` | `max` - exact strings).

## 2. The non-negotiables (every delegation, always)

1. ALWAYS pass `provider`, `model`, and `reasoning_effort` EXPLICITLY on
   every subagent call and every workflow agent() call. NEVER rely on
   child defaults, inheritance, or "the configured default" - the
   parent-inherited default silently resolves to the planner lane and
   wastes tokens (a measured policy violation).
2. Never use a model outside the allowed set above.
3. The user's explicit override wins for the task it names.
4. Never edit the agent-loop config while subagents are running (live
   re-apply destroys running agents' inbox projections and can crash the
   host - config changes require a restart with no active subagents).

## 3. The methodologies (the delegation loop)

THE ORCHESTRATOR LOOP (the main agent's duty): receive the user's
thought -> formalize it (scope, surface, exclusions, the arbiter, the
report format, the shared facts) -> pick the strain -> delegate (an
ACTIVE agent in the serialized queue, or an IDLE agent) -> monitor (the
queue bookkeeping, the surface-conflict analysis - concurrent lanes only
when the files are provably disjoint - the stall recovery via checkpoint
nudges, the failure handling: verify the tree for partial edits, then
re-dispatch with the corrected spec) -> verify (run the arbiters
yourself; trust the printed suite totals over prose claims) -> report
(the results, the residuals, the user's decisions; the user commits -
agents never commit).

THE SPEC-RECONFIGURATION AUTHORITY (user-granted): as requirements come
in and change, and as the other agents report feedback, the orchestrator
re-configures the specs - amends idle agents via messages (they
acknowledge "<NAME> SPEC AMENDED - IDLE"), amends working agents
mid-flight when compatible, re-applies the changed requirements to the
not-yet-started prompts, re-dispatches failed agents with corrected
specs. The durable queue + the new agents are recorded in the process
record so the state survives connectivity losses and session switches.

THE IDLE-AGENT PROTOCOL (the paused strain): launch with a fully
self-contained spec + the activation rules; the agent retains it
verbatim, does NO work, replies "<NAME> SPEC RETAINED - IDLE", waits for
the activation message, then executes exactly with the arbiter. The
amendments arrive via messages and override the base spec where they
conflict. Idle agents cost zero wall-clock time and fire when their
surface frees up - the incremental, synchronous, wall-clock-ordered
regime.

## 4. The shared facts the strains must not contradict

The DeepSeek monorepo batch's truth: the smoke totals Classic 733 /
EffectTS 746 (the suites print them); the per-suite pairs (core 14/17,
factory 34/41, governor 78/81, pinner 32, cargo 62, dash 132, five
flavors 62, file 71); the factory surface 19 callable methods (SCHEME
§2.7 Write+GuardedWrite, §2.16 UpdateKey, §2.17 RegisterGovern, §2.18
Govern); the releases at 0.0.1; the effect pin 4.0.2; the ncuBin default
"ncu" (PATH-resolved); the releases CC0-1.0; the Boilerplate + the live
~/.dsh are the internal baselines (personal paths stay - the pending
gitignore/submodule decision); Documentation/Plans/ + Reports/ are the
process records. The conventions: tabs (tabWidth 4, printWidth 100),
YAML stays spaces; the typography laws (Inter + IBM Plex Mono, the 13px
floor, no JetBrains Mono); the Harness Blue tokens + zero elevation;
quoted ledger strings stay byte-exact; flag-don't-fix content conflicts.

## 5. The cultivation sites (per-strain operating contexts)

- The EXPLORER is cultivated in read-only surfaces with bounded reading
  (scaffold-first prompts), verified by deterministic shell checks - its
  mistakes are corrected downstream for free.
- The CODER is cultivated with self-contained specs carrying the
  arbiters (the smokes / the site build), the never-commit rule, the
  report format (before -> after with file:line anchors, the arbiter
  results, the residuals), and the attempts ladder for failures.
- The PLANNER is cultivated with the shared facts, the process record,
  and the spec-reconfiguration authority - it is the lane that designs,
  corrects, and escalates.
## 6. The environment + the scope discipline (user-mandated 2026-10-08)

- YOU ARE NEVER ALONE: the batch runs MANY agents at once - lanes activate in pairs, and a dozen more idle agents wait in the queue. The parent's activation message carries the CURRENT STATE BLOCK (the running lanes + their tasks, the pending count, the scope reminder) - read it and treat it as part of the spec. The subagent tooling has NO batch-state broadcast - the parent's messages + the process records (Documentation/Plans/TOMORROW-REVIEW.md) are the runtime facts.
- VERIFY THE ENVIRONMENT: check the tree state (git status, the recent commits - the user commits MID-SESSION, so HEAD moves under you; the other lanes' in-flight files show as modifications) before AND during the work. Never assume you are the only writer or that the tree is clean.
- STAY IN SCOPE: the surfaces the other lanes own are off-limits (the state block lists them). Read-before-edit ALWAYS on shared files; coordinate via the report; never fight over a file region.
- THE SURGICAL-EDIT DISCIPLINE (hard rule): every file modification through the harness TOOL API only - the read tool first, the edit tool (literal match, per-region fixes). NEVER python/sed/awk/scripts for content mutation (the terminal runs COMMANDS - the builds, the tests, the scans - never edits). Bulk transformations are forbidden - per-file surgical edits with the arbiter verified after EVERY file. The write/edit tools are the governed path - the fs/observed chain fires on them (the family's whole point).
- THE BUILD-VERIFIED RULE: after every file you touch, the relevant arbiter must pass before continuing (the site build for the site files; the smokes for the packages). Never leave the tree broken at any moment - fix your break immediately.
- THE COMMON SKILLS: the global ~/.dsh/skills/ (task-routing, code-authoring, harness-observability, this manual) + the project's Documentation/Skill/ (idle-agent-protocol, orchestrator-batch, instructional-writing, plugin-system, smoke-writing) bind every agent - load the relevant one when in doubt.

## 7. The session-resume awareness (user-mandated 2026-10-09)

- A multi-session batch can resume in a NEW conversation: the starting brief lives
  in Documentation/Handoff/BATCH-HANDOFF-<date>.md (the project state, the idle
  lanes, the feedback ledger, the decisions) + the per-task files in
  Documentation/Handoff/Tasks/ (each with the temporary current state). READ the
  latest handoff before resuming the queue.
- THE ROUTING is the law: every launch passes provider/model/effort EXPLICITLY
  (the omission inherits the parent route - the DeepSeek - a violation). The
  routing-enforcer plugin automates it silently later.
- The environment discipline: the user commits mid-session; the concurrent lanes
  edit the same tree; read-before-edit always; the surgical edits + the
  build-verified rules bind every lane.
- THE ORCHESTRATOR'S NON-EXECUTION LAW (2026-10-09 - binding for every
  session): the orchestrator does NOT execute on the feedback - no builds, no
  site edits, no measurement runs, no surface-location investigation before
  relaying. The feedback arrives VERBATIM in the activation message; YOU
  (the lane) investigate + locate + execute + build + verify, and your report
  carries the arbiter numbers. The orchestrator's hands-on work is limited to
  relaying verbatim, keeping the records, and read-only spot-checks of the
  reported claims.
