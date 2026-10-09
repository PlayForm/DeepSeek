> Specialized working copy (repo): synced from ~/.dsh/skills/task-routing/ on 2026-10-10, byte-faithful. This is the specialized truth for this monorepo's sessions; the global copy is the fallback. Sync future changes to BOTH.
---
name: task-routing
description: THE model-routing policy for every delegation — exploration always GLM-5.3-Flash at low; coding GLM-5.3-Flash low then high; planning and advanced tasks DeepSeek V4 Flash max; failover escalation on explicit ESCALATION markers or verification failures. Load before delegating anything.
whenToUse: Mandatory before every subagent delegation, workflow launch, or model choice for any task. If you are about to delegate a coding, exploration, planning, or advanced-reasoning task without having followed this policy, stop and apply it.
---

# Task Routing Policy (operating manual)

This document is the single source of truth for how this harness spends
tokens. Every agent (parent, child, workflow phase) MUST follow it. It was
derived from 27 benchmark runs across 3 rounds (2026-10), all independently
adjudicated. Deviating without a user instruction is a policy violation.

## 0. Non-negotiables (apply to every delegation, always)

1. **Always pass `provider`, `model`, and `reasoning_effort` EXPLICITLY** on
   every `subagent` call and every workflow `agent()` call. Never rely on
   child defaults, inheritance, or "the configured default".
   - provider: `cloudflare-workers-ai`
   - reasoning_effort values: `low` | `high` | `max` (exact strings)
2. **Never use a model outside `allowedModels`** in the profile patch
   (`subagent-model-selection-settings`). The allowed set is exactly the two
   models in section 1.
3. **The user's explicit override wins** for the task it names. Nothing else
   overrides this policy.
4. If the harness crashes or an agent dies mid-run (e.g. `400
INVALID_REQUEST`, projection errors): completed runs' sessions and
   artifacts persist on disk — recover from the workspace and session logs;
   do not re-run finished work. Never edit `agent-loop` config while
   subagents are running (live re-apply destroys running agents' inbox
   projections and can crash the host — config changes to `agent-loop`
   require a restart with no active subagents).

## 1. Model catalog (exactly 2 models — do not invent others)

| Model ID (exact)                         | Input $/1M | Output $/1M | Cached $/1M | Context |
| ---------------------------------------- | ---------- | ----------- | ----------- | ------- |
| `@cf/zai-org/glm-5.3-flash`              | $0.15      | $0.50       | $0.03       | 1.3M    |
| `@cf/deepseek-ai/deepseek-v4-flash-0731` | $0.44      | $1.32       | $0.044      | 1.3M    |

**Removed models — never request these, they are not in the catalog:**

- `@cf/qwen/qwen3-30b-a3b-fp8` — 32k context; VERIFIED (2 runs, 2026-10-02)
  to die with `400 INVALID_REQUEST` (context overflow) after a few tool calls
  in any agentic loop. Unusable for subagent work. Removed entirely.
- `@cf/deepseek-ai/deepseek-v4-pro-0813`, `@cf/moonshotai/kimi-k2.6`,
  `@cf/moonshotai/kimi-k2.7-code`, `@cf/zai-org/glm-5.2`,
  `@cf/zai-org/glm-5.3`, `@cf/qwen/qwen3.8-27b` — removed for cost
  (anything ≥ $0.95/M input or $3.20/M output).
- `@cf/zai-org/glm-4.7-flash` — removed after losing the 2026-09 exploration
  comparison (hallucinated structure, mojibake).

## 2. Routing table (the complete policy)

| Task type                                                                        | Model (exact ID)                         | reasoning_effort                      |
| -------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------- |
| Exploration — ANY exploration, ALWAYS                                            | `@cf/zai-org/glm-5.3-flash`              | `low`                                 |
| Coding — trivial, well-specified (spec is complete, single-file, no ambiguity)   | `@cf/zai-org/glm-5.3-flash`              | `low`                                 |
| Coding — routine / typical (any real feature, refactor, multi-file, integration) | `@cf/zai-org/glm-5.3-flash`              | `high`                                |
| Coding — exhaustive verification                                                 | `@cf/zai-org/glm-5.3-flash`              | `max` — ONLY on explicit user request |
| Planning, architecture, design, advanced debugging                               | `@cf/deepseek-ai/deepseek-v4-flash-0731` | `max`                                 |
| Deepest reasoning (the ceiling — there is no model above this)                   | `@cf/deepseek-ai/deepseek-v4-flash-0731` | `max`                                 |

The main agent itself runs `deepseek-v4-flash-0731` at `max`
(`agent-default-model`) — that IS the planning/advanced lane. Planning tasks
must never be delegated to a GLM flash-tier model.

## 3. Exploration protocol (low is ALWAYS the answer)

- Every exploration task (repo surveys, research, read-only analysis) runs on
  `@cf/zai-org/glm-5.3-flash` at `low`. No exceptions based on "importance" or
  "stakes" — see the adjudication protocol (section 5) for why that is safe.
- Rationale: correctness across efforts is identical (benchmarks); `low`
  occasionally hallucinates minor details (measured: 1-2 per report), and
  downstream validation is deterministic and FREE (shell checks), so later
  stages correct mistakes without LLM re-review tokens. `high`/`max` do not
  reduce the hallucination rate (they reduce nothing measurable) and cost
  1.5-6×.
- Exception (the ONLY one): if exploration feeds a coding task and comes back
  unusably thin (missing the facts the coding task needs), ONE re-run at
  `high` is allowed. Never `max`.
- If the user explicitly asks for "archaeology" (find everything incl.
  history, remnants, provenance): `max` is permitted — it is the only effort
  that consistently catches errors in other reports.

## 4. Coding protocol (attempts ladder + failover)

Attempt ladder, in order, per coding task:

1. **Attempt 1**: `glm-5.3-flash` at `low` (trivial) or `high` (routine).
2. **Attempt 2** (only if attempt 1 fails per the failure signals below):
   `glm-5.3-flash` at `high`.
3. **Escalation** (only if attempt 2 fails): the PARENT re-delegates the same
   task to `@cf/deepseek-ai/deepseek-v4-flash-0731` at `max`, passing the
   failed run's artifacts (workspace files, build logs) and a failure summary
   as context. Escalate at most once per task.
4. If the escalated run also fails: STOP. Report BOTH failure summaries to
   the user. Do not loop.

Failure signals (any of these means the attempt failed):

- The subagent ended its report with `ESCALATION: <concrete reason>` (the
  mandated marker; reasons: build error, context overflow, spec
  contradiction, repeated verification failure).
- The subagent gave up WITHOUT the marker (missing build, failing tests,
  missing artifacts, empty workspace).
- The parent's own verification of the artifacts failed (see section 5).

Spec-writing rules (the parent writes the coding prompt):

- Every coding task ships with a verification protocol: build command +
  explicit test cases + expected outputs, including adversarial edge cases
  (non-repo dirs, permissions, empty inputs, stale locks, binary/UTF-8
  input). Deterministic test batteries are free to run — always include them.
- Every coding prompt MUST instruct: "If you cannot complete this task, do
  NOT silently give up — end your report with a section starting exactly
  with `ESCALATION: <concrete reason>`." This marker is what triggers the
  failover.
- Forbid the subagent from reading reference implementations when the task
  is a replication benchmark.

## 5. Adjudication protocol (keeps `low` safe — this is mandatory)

Every delegated result is verified by the parent BEFORE being accepted:

1. **Docs-over-disk rule**: whenever a report claims a file/directory exists,
   verify against the filesystem (`ls`, `test -e`, `git ls-tree`). NEVER
   trust README/AGENTS.md claims over disk. Measured failure: the
   `verify_tokens.py` stale-doc claim was repeated by 4 of 6 explorer runs
   (only max-effort runs and one low run checked disk).
2. **Spot-check novel claims**: 2-3 shell checks per report on anything
   surprising (paths, counts, commit hashes, file existence). Hallucination
   patterns to watch: name-association (a "Next" directory claimed to be
   Next.js when it is a Rust crate), phantom paths (`e/Branch/Current/...`
   that does not exist), stale doc references.
3. **Coding adjudication**: build it yourself + run the test battery +
   run edge cases BEYOND the spec's list. The v1 `high` replica's lock flaw
   (false timeouts on non-repo dirs) was only caught by an extra edge case,
   not by its own tests.
4. **Cost measurement**: token usage is in each subagent's session log
   (`~/.dsh/sessions/<workspace>/<agent-id>/session.v4.jsonl.zstd`,
   `data.usage` per assistant message: `inputTokens`, `outputTokens`,
   `cacheReadTokens`). Extract and report costs for any benchmark.
5. **Never** spend LLM tokens on verification. Shell checks are free and
   deterministic — that is the entire reason `low`-exploration is safe.

## 6. Benchmark evidence (the numbers behind this policy)

- 27 runs, 3 rounds, 2 task classes (exploration, coding), all adjudicated.
- Correctness is identical across `low`/`high`/`max` on BOTH task classes.
- Coding `max` cost **6.4×** `low` for identical correctness ($0.112 vs
  $0.018 — 83k vs 11k output tokens; the extra output was report length).
- Exploration `max` cost **5.8×** `low` ($0.065 vs $0.011).
- `high` costs 1.5-3× `low` with no correctness advantage.
- Failover protocol proven twice (qwen death → `high` replacement, clean
  results both times; exploration and coding).
- At scale the blended cost is ~$50 per billion total tokens (mostly cached
  reads at $0.03/M). Output is 3.3× input price; each 1% of output adds ~$5
  per billion tokens. Knob choices are worth $5-100 per billion tokens.

## 7. Authoring discipline

File modifications and code style live in the dedicated skill:
**`code-authoring`** — hard rules: never edit files through the terminal
(`sed`/`awk`/python in-place) and never read file content through the
terminal (`cat`/`grep`/`sed -n`); always use the read/write/edit tool API;
plus the atomized Rust-style writing conventions. THE MECHANISM: terminal
edits are invisible to the plugin system — `fs/observed` fires only on
tool-layer writes, so tool edits are what make the governor/pinner/cargo
plugins actually run. Load it before editing or reading any file.

## 8. Operational rules

- The same routing applies inside `workflow` scripts: every `agent()` call
  passes `provider`/`model`/`reasoning_effort` explicitly per phase.
- `agent-loop` pinned roles (from the profile patch): `coder` →
  glm-5.3-flash `high`, `explorer` → glm-5.3-flash `low`, `planner` →
  deepseek-v4-flash `max`. These match this policy.
- Do not "helpfully" escalate a task that succeeded. Do not re-run
  completed work. Do not use `max` to compensate for a vague prompt — fix
  the prompt instead.
- When in doubt about which lane a task belongs to: exploration → `low`;
  anything that produces code → coding ladder; anything that decides
  architecture/plans → main agent (deepseek-v4-flash `max`).
