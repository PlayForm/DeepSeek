> Specialized working copy (repo): synced from ~/.dsh/skills/task-routing/ on 2026-10-20, byte-faithful. This is the specialized truth for this monorepo's sessions; the global copy is the fallback. Sync future changes to BOTH.

---
name: task-routing
description: THE model-routing policy for every delegation — exploration always GLM-5.3-Flash at low; coding GLM-5.3-Flash low then high; planning and advanced tasks DeepSeek V4 Flash max; failover escalation on explicit ESCALATION markers or verification failures. Load before delegating anything.
whenToUse: Mandatory before every subagent delegation, workflow launch, or model choice for any task. If you are about to delegate a coding, exploration, planning, or advanced-reasoning task without having followed this policy, stop and apply it.
---

# Task Routing Policy - Operating Manual

The single source of truth for how this harness spends tokens on
delegation: which model and effort every parent, child, and workflow
phase uses, and how results are verified. Derived from 27 benchmark runs
across 3 rounds (2026-10), all independently adjudicated. The full
philosophy lives in the references; this file is the index.

## The Mandate

- **Policy scope** - see ./references/policy-scope.md
  One policy binding every agent (parent, child, workflow phase); deviating without a user instruction is a policy violation.

## Non-Negotiables (every delegation, always)

1. **Explicit routing fields** - see ./references/non-negotiables.md
   Every `subagent` and workflow `agent()` call passes `provider: cloudflare-workers-ai`, the exact model, and `reasoning_effort: low | high | max` explicitly; never rely on defaults or inheritance.
2. **allowedModels only** - see ./references/non-negotiables.md
   Never use a model outside `allowedModels` in the profile patch (`subagent-model-selection-settings`); the allowed set is exactly the two catalog models.
3. **User override wins** - see ./references/non-negotiables.md
   The user's explicit override wins for the task it names; nothing else overrides this policy.
4. **Crash recovery and config safety** - see ./references/non-negotiables.md
   On a harness crash or dead agent, recover persisted sessions/artifacts and never re-run finished work; never edit `agent-loop` config while subagents are running (live re-apply destroys inbox projections and can crash the host).

## Model Catalog

- **The two allowed models** - see ./references/model-catalog.md
  Exactly 2 models: `@cf/zai-org/glm-5.3-flash` ($0.15/$0.50/$0.03 per 1M in/out/cached, 1.3M ctx) and `@cf/deepseek-ai/deepseek-v4-flash-0731` ($0.44/$1.32/$0.044, 1.3M ctx).
- **Removed models** - see ./references/model-catalog.md
  Never request removed models: qwen3-30b-a3b-fp8 (verified `400 INVALID_REQUEST` deaths, 2026-10-02), six cost removals (>= $0.95/M in or $3.20/M out), glm-4.7-flash (lost 2026-09 exploration comparison).

## Routing Table and the Difficulty-First Principle

- **Difficulty-first principle** - see ./references/difficulty-first.md
  User-mandated 2026-10-20, binding: infer the effort from the task's ACTUAL difficulty - MECHANICAL operations (sweeps, renames, conversions, well-specified multi-file edits with a guarded exceptions list) are trivial regardless of file count; SEMANTIC operations (naming judgment, authoring, design, ambiguous refactors) are routine; the file count alone never decides.
- **The complete routing table** - see ./references/routing-table.md
  Exploration ALWAYS glm-5.3-flash `low`; trivial/mechanical coding `low`; routine/semantic coding `high`; exhaustive verification `max` (explicit user request only); planning and deepest reasoning deepseek-v4-flash-0731 `max`.
- **The main agent's lane** - see ./references/routing-table.md
  The main agent runs `deepseek-v4-flash-0731` at `max` (`agent-default-model`) - that IS the planning/advanced lane; planning must never be delegated to a GLM flash-tier model.

## Exploration Protocol

- **Low is always the answer** - see ./references/exploration-protocol.md
  Every exploration task runs glm-5.3-flash at `low` with no stakes-based exceptions (correctness is identical across efforts; validation is deterministic and free); the ONLY exception is one re-run at `high` for an unusably thin survey feeding a coding task, and user-requested "archaeology" is the one permitted `max`.

## Coding Protocol

- **The attempts ladder** - see ./references/coding-ladder.md
  Attempt 1 per routing tier; attempt 2 at `high`; then ONE parent-owned escalation to deepseek-v4-flash `max` with the failed run's artifacts and failure summary; if that also fails, STOP and report both summaries - no looping.
- **Failure signals** - see ./references/failure-signals.md
  An attempt fails on any of: the `ESCALATION: <concrete reason>` marker, a silent give-up (missing build/tests/artifacts/empty workspace), or the parent's own verification failing.
- **Spec-writing rules** - see ./references/spec-writing.md
  Every coding prompt ships a verification protocol (build command + explicit test cases + expected outputs incl. adversarial edge cases), the verbatim `ESCALATION:` give-up instruction, and a no-reference-implementations clause for replication benchmarks.

## Adjudication Protocol

- **Verify before accepting** - see ./references/adjudication-protocol.md
  Docs-over-disk (never trust README/AGENTS.md over the filesystem - the measured 4-of-6 stale-doc failure), 2-3 shell spot-checks on novel claims, coding adjudication with edge cases BEYOND the spec's list, cost extraction from session logs (`data.usage`: inputTokens/outputTokens/cacheReadTokens), and NEVER spending LLM tokens on verification - that is why `low` is safe.

## Benchmark Evidence

- **The numbers behind the policy** - see ./references/benchmark-evidence.md
  27 runs/3 rounds/2 task classes; correctness identical across `low`/`high`/`max`; coding `max` = 6.4x `low` ($0.112 vs $0.018, 83k vs 11k output tokens), exploration `max` = 5.8x ($0.065 vs $0.011); `high` = 1.5-3x with no correctness gain; failover proven twice; blended cost ~$50 per billion tokens.

## Authoring Discipline

- **File rules live in code-authoring** - see ./references/authoring-discipline.md
  Never edit or read files through the terminal; always use the read/write/edit tool API - because `fs/observed` fires only on tool-layer writes, tool edits are what make the governor/pinner/cargo plugins run.

## Operational Rules

- **Workflow scripts follow the same routing** - see ./references/operational-rules.md
  Every `agent()` call in a workflow passes `provider`/`model`/`reasoning_effort` explicitly per phase.
- **Pinned roles match this policy** - see ./references/operational-rules.md
  `agent-loop` pinned roles: `coder` -> glm-5.3-flash `high`, `explorer` -> glm-5.3-flash `low`, `planner` -> deepseek-v4-flash `max`.
- **No overreach** - see ./references/operational-rules.md
  Do not escalate a succeeded task, re-run completed work, or use `max` to compensate for a vague prompt - fix the prompt instead.
- **Tie-breaker** - see ./references/operational-rules.md
  When in doubt: exploration -> `low`; anything producing code -> coding ladder; anything deciding architecture/plans -> main agent (deepseek-v4-flash `max`).
