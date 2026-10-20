> Specialized working copy (repo): synced from ~/.dsh/skills/worker-strains/ on 2026-10-20, byte-faithful. This is the specialized truth for this monorepo's sessions; the global copy is the fallback. Sync future changes to BOTH.

---
name: worker-strains
description: THE consolidated GLOBAL manual for the worker strains and the delegation methodologies of this harness - the three strains (explorer / coder / planner), their models and efforts (the full routing policy lives in the task-routing skill - load BOTH before delegating), their cultivation rules, the idle-agent protocol, and the orchestrator-batch loop. Load before ANY delegation in ANY conversation, so the strains are always known and the methodologies always applied.
whenToUse: Mandatory before every subagent delegation, workflow launch, or model choice in ANY conversation - together with the task-routing skill. If you are about to delegate without knowing the strains (which model, which effort, which protocol), STOP and read this manual + the task-routing skill first.
---

# Worker Strains - Operating Manual (global)

This harness cultivates THREE worker strains - EXPLORER, CODER,
PLANNER. Every delegation picks a strain first, then the model + effort
per the task-routing policy (load BOTH skills before delegating); each
strain is a cultivation site with its own conditions, protocols, and
failure handling, and the user's explicit override always wins.
Canonical skill structure per the mandate of 2026-10-20: this file is
the index - the full philosophy lives in the references.

## The strain system

- **The three strains (strain-first selection)** - see
  ./references/three-strains-overview.md
  The strains are cultivation sites, not labels: pick the strain before
  the model, the routing law lives in the task-routing skill, and the
  user's explicit override wins for the task it names.

## 1. The strains

- **EXPLORER** - see ./references/explorer-strain.md
  Read-only surveys, research, scans, archaeology on
  @cf/zai-org/glm-5.3-flash at low ALWAYS (one high re-run only when
  feeding a coding task that came back unusably thin; max only on an
  explicit "archaeology" request); cultivated read-only, scaffold-first,
  verified by free deterministic shell checks.
- **CODER** - see ./references/coder-strain.md
  Implementation, refactors, multi-file features, integration on
  @cf/zai-org/glm-5.3-flash at high (routine) / low (trivial,
  single-file, fully specified); the attempts ladder (GLM high -> GLM
  high -> escalate ONCE to DeepSeek max -> STOP), the
  `ESCALATION: <reason>` marker, never-commit, arbiters in every spec.
- **PLANNER** - see ./references/planner-strain.md
  Planning, architecture, design, advanced debugging, the deepest
  reasoning on @cf/deepseek-ai/deepseek-v4-flash-0731 at max - the main
  agent runs this lane itself (agent-default-model); planning is NEVER
  delegated to a GLM flash-tier model.
- **Allowed models** - see ./references/allowed-models.md
  Exactly two models (@cf/zai-org/glm-5.3-flash,
  @cf/deepseek-ai/deepseek-v4-flash-0731), provider
  `cloudflare-workers-ai`, efforts low | high | max - exact strings,
  never invent others.

## 2. The non-negotiables (every delegation, always)

1. **Explicit routing parameters** - see
   ./references/explicit-routing-params.md
   Pass provider/model/effort explicitly on every subagent call and
   every workflow agent() call; the inherited default silently resolves
   to the planner lane and wastes tokens (a measured violation).
2. **Allowed models only** - see ./references/allowed-models.md
   Never use a model outside the exact two-model set.
3. **The user's override wins** - see
   ./references/three-strains-overview.md
   Scoped to the task the user names; the strain defaults resume
   afterwards.
4. **No live config edits** - see
   ./references/no-live-config-edits.md
   Never edit the agent-loop config while subagents run; live re-apply
   destroys running agents' inbox projections and can crash the host -
   config changes require a restart with no active subagents.

## 3. The methodologies (the delegation loop)

- **The orchestrator loop** - see ./references/orchestrator-loop.md
  Receive -> formalize (scope, surface, exclusions, arbiter, report
  format, shared facts) -> pick strain -> delegate -> monitor -> verify
  (run the arbiters yourself; printed suite totals over prose) ->
  report; the user commits - agents never commit.
- **The spec-reconfiguration authority** - see
  ./references/spec-reconfiguration-authority.md
  User-granted: amend idle agents via messages ("<NAME> SPEC AMENDED -
  IDLE"), amend working agents mid-flight when compatible, re-apply to
  not-yet-started prompts, re-dispatch failed agents; the durable
  queue is recorded in the process record.
- **The idle-agent protocol** - see ./references/idle-agent-protocol.md
  Launch with a fully self-contained spec + activation rules; the
  agent retains it verbatim, does NO work, replies "<NAME> SPEC
  RETAINED - IDLE", and executes exactly with the arbiter on
  activation; zero wall-clock cost until its surface frees up.

## 4. The shared facts

- **The monorepo's truth** - see
  ./references/shared-facts-monorepo.md
  The smoke totals (Classic 733 / EffectTS 746 + the per-suite pairs),
  the 19-method factory surface (SCHEME sect. 2.7/2.16/2.17/2.18), the
  releases at 0.0.1 CC0-1.0, the effect pin 4.0.2, ncuBin "ncu", the
  conventions (tabs tabWidth 4 printWidth 100, YAML stays spaces, the
  typography laws, Harness Blue + zero elevation, byte-exact ledger
  strings, flag-don't-fix conflicts).

## 5. The cultivation sites (per-strain operating contexts)

- **EXPLORER's cultivation** - see ./references/explorer-strain.md
  Read-only surfaces, bounded scaffold-first reading, verified by
  deterministic shell checks; mistakes corrected downstream for free.
- **CODER's cultivation** - see ./references/coder-strain.md
  Self-contained specs carrying the arbiters, the never-commit rule,
  the before -> after report format with file:line anchors, and the
  attempts ladder for failures.
- **PLANNER's cultivation** - see ./references/planner-strain.md
  The shared facts, the process record, and the spec-reconfiguration
  authority - the lane that designs, corrects, and escalates.

## 6. The environment + the scope discipline (user-mandated 2026-10-08)

- **You are never alone** - see ./references/you-are-never-alone.md
  Lanes activate in pairs and a dozen idle agents wait in the queue;
  the activation message's CURRENT STATE BLOCK is part of the spec;
  the subagent tooling has NO batch-state broadcast - the parent's
  messages + the process records (Documentation/Plans/
  TOMORROW-REVIEW.md) are the runtime facts.
- **Verify the environment** - see
  ./references/verify-the-environment.md
  Check the tree state (git status, recent commits) before AND during
  the work; the user commits MID-SESSION (HEAD moves); the other
  lanes' in-flight files show as modifications.
- **Stay in scope** - see ./references/stay-in-scope.md
  The other lanes' owned surfaces are off-limits; read-before-edit
  ALWAYS on shared files; coordinate via the report; never fight over
  a file region.
- **The surgical-edit discipline** - see
  ./references/surgical-edit-discipline.md
  Every file modification through the harness tool API only (read
  first, edit with literal match); never python/sed/awk/scripts for
  content mutation; bulk transformations forbidden; the arbiter
  verified after EVERY file.
- **The build-verified rule** - see
  ./references/build-verified-rule.md
  After every touched file, the relevant arbiter passes before
  continuing (site build for site files, smokes for packages); never
  leave the tree broken - fix immediately.
- **The common skills** - see ./references/common-skills.md
  The global ~/.dsh/skills/ set (task-routing, code-authoring,
  harness-observability, this manual) + the project's
  Documentation/Skill/ set (idle-agent-protocol, orchestrator-batch,
  instructional-writing, plugin-system, smoke-writing) bind every
  agent; load the relevant one when in doubt.

## 7. The session-resume awareness (user-mandated 2026-10-09)

- **The handoff files** - see
  ./references/session-resume-handoff.md
  A batch can resume in a NEW conversation: read the latest
  Documentation/Handoff/BATCH-HANDOFF-<date>.md + the per-task files
  in Documentation/Handoff/Tasks/ before resuming the queue.
- **The routing is the law** - see
  ./references/explicit-routing-params.md
  Every launch passes provider/model/effort explicitly; the omission
  inherits the parent route (the DeepSeek) - a violation; the
  routing-enforcer plugin automates it silently later.
- **The environment discipline at resume** - see
  ./references/verify-the-environment.md
  Mid-session commits, concurrent lanes on one tree, read-before-edit
  always, surgical edits + build-verified bind every lane at resume
  too.
- **The orchestrator's non-execution law** - see
  ./references/orchestrator-non-execution.md
  The orchestrator does NOT execute on feedback (no builds, no edits,
  no measurement runs, no surface-location investigation); it relays
  verbatim, keeps the records, and spot-checks read-only; the lane
  investigates + executes + reports the arbiter numbers.
