---
name: task-routing
description:
    "The model-routing policy for every delegation: the three-model catalog, the difficulty-first
    classification, the routing table, the attempts ladder, the spec requirements, and the
    adjudication protocol that makes cheap exploration safe."
whenToUse:
    Before every subagent call, workflow agent() call, or any decision about which model and
    reasoning effort to use. Also load it when a delegation fails and you must decide whether to
    retry or escalate.
version: 2.0.0
updated: 2026-10-20
---

# Task Routing

This skill is the single authority on model choice and reasoning effort. Every other skill that
mentions routing points here. The policy exists to spend tokens where judgment is needed and nowhere
else; its safety depends on the parent verifying results deterministically, not on trusting a cheap
model.

## When to use

- Before any `subagent`, `subagent_fork`, or workflow `agent()` call.
- When choosing the model for a task you will do yourself (the main agent's lane is part of the
  table).
- When a delegated attempt fails and the next step is a retry, an escalation, or a stop.
- Do not use for: strain definitions and delegation methodology (`worker-strains`), or batch queue
  mechanics (`orchestrator-batch`).

## The non-negotiables

1. **Pass the route explicitly.** Every delegation passes `provider`, `model`, and
   `reasoning_effort`. Omission inherits the parent's route, which is the expensive lane.
2. **Use only the three catalog models.** `@cf/zai-org/glm-5.3-flash`,
   `@cf/deepseek-ai/deepseek-v4.1-flash-1017`, `@cf/deepseek-ai/deepseek-v4-flash-0731`. The
   provider is `cloudflare-workers-ai`; the effort tokens are exactly `low`, `high`, `max`.
3. **The user's explicit override wins** for the task it names. It does not extend to other tasks
   and does not become a new default.
4. **Recover, do not re-run.** After a crash or a dead agent, read the persisted sessions and
   artifacts and resume the unfinished work. Never edit the agent-loop config while subagents run; a
   live re-apply can destroy inbox projections and crash the host.

## The catalog

| Model                                      | Input $/1M | Output $/1M | Cached $/1M | Context |
| ------------------------------------------ | ---------: | ----------: | ----------: | ------: |
| `@cf/zai-org/glm-5.3-flash`                |       0.15 |        0.50 |        0.03 |      1M |
| `@cf/deepseek-ai/deepseek-v4.1-flash-1017` |       0.30 |        1.20 |       0.006 |      1M |
| `@cf/deepseek-ai/deepseek-v4-flash-0731`   |       0.44 |        1.32 |       0.044 |      1M |

The DeepSeek lane's primary is `deepseek-v4.1-flash-1017` (cheaper than 0731 on every axis);
`deepseek-v4-flash-0731` is the fallback. Verify the live catalog with `list_subagent_models`;
verify the allowed set against the profile's `allowedModels`.

Never request a removed model: `qwen3-30b-a3b-fp8` (400 failures in agentic loops), the cost
removals (`deepseek-v4-pro-0813`, `kimi-k2.6`, `kimi-k2.7-code`, `glm-5.2`, `glm-5.3`,
`qwen3.8-27b`), or `glm-4.7-flash` (lost the exploration comparison).

## Difficulty first

Classify by what the operation demands, not by the task's label or file count:

- **Mechanical**: a complete spec, no ambiguity, lookup-and-replace, renames, conversions, a guarded
  exceptions list. File count does not raise the tier.
- **Semantic**: naming judgment, authored prose, design decisions, ambiguous refactors, integration.

A multi-file mechanical sweep is still mechanical. A one-line naming judgment is still semantic.

## The routing table

| Task                                                | Model                      | Effort |
| --------------------------------------------------- | -------------------------- | ------ |
| Exploration, any, always                            | `glm-5.3-flash`            | `low`  |
| Coding, trivial or mechanical (complete spec)       | `glm-5.3-flash`            | `low`  |
| Coding, routine or semantic                         | `glm-5.3-flash`            | `high` |
| Coding, exhaustive verification (user request only) | `glm-5.3-flash`            | `max`  |
| Planning, architecture, design, advanced debugging  | `deepseek-v4.1-flash-1017` | `max`  |
| The deepest reasoning (the ceiling)                 | `deepseek-v4.1-flash-1017` | `max`  |

The DeepSeek rows accept either DeepSeek id at `max`; 1017 is primary and 0731 is the fallback. The
main agent runs the DeepSeek lane at `max`; its current default is `deepseek-v4.1-flash-1017`.
Planning is never delegated to the GLM tier.

## The ladder

1. Attempt 1 at the task's tier (`low` or `high`).
2. If it fails, attempt 2 at `high`.
3. If it fails, the parent escalates once to the DeepSeek lane at `max`, passing the failed run's
   artifacts and a failure summary.
4. If that fails, stop and report both summaries. No fourth attempt.

An attempt fails on any of: the `ESCALATION: <reason>` marker, a silent give-up (no build, no tests,
no artifacts, an empty workspace), or the parent's own verification failing.

## The spec

Every coding prompt carries:

1. The verification protocol: the build command, explicit test cases, and expected outputs,
   including adversarial cases (non-repo directories, permissions, empty inputs, stale locks, binary
   or UTF-8 input).
2. The verbatim instruction: "If you cannot complete this task, do not silently give up. End your
   report with a section starting exactly with `ESCALATION: <concrete reason>`."
3. For a replication benchmark, a no-reference-implementations clause.

## The adjudication

The parent verifies before accepting:

1. **Docs lose to disk.** Check every claimed path with `ls`, `test -e`, or `git ls-tree`.
2. **Spot-check 2-3 surprising claims.** Watch for name association ("Next" assumed to be Next.js),
   phantom paths, and stale doc references.
3. **Coding:** build it, run the battery, then add edge cases beyond the spec's list.
4. **Cost:** extract `inputTokens`, `outputTokens`, and `cacheReadTokens` from the subagent's
   session log when reporting.
5. **Never spend LLM tokens on verification.** Shell checks are free and deterministic; that is why
   `low` is safe.

## Verification

- Every delegation in the transcript carries the explicit triple.
- The model ids match the catalog exactly, including suffixes.
- A failed task shows at most three attempts.
- Each accepted result has a logged parent verification.

## Anti-patterns

| Mistake                              | Cost                                     | Do instead                    |
| ------------------------------------ | ---------------------------------------- | ----------------------------- |
| Omitting the route                   | Inherits the expensive lane; unauditable | Pass provider, model, effort  |
| Sending exploration to DeepSeek      | 5.8x cost for identical correctness      | GLM at `low`                  |
| Calling a mechanical sweep "routine" | Pays `high` for no gain                  | Difficulty first              |
| Self-authorizing coding `max`        | 6.4x cost for identical correctness      | Only on explicit user request |
| Escalating without artifacts         | Reproduces the failure                   | Pass the failure state        |
| LLM re-review of a report            | Destroys the economics                   | Shell checks only             |

## References

| File                             | Covers                                             | Read when                    |
| -------------------------------- | -------------------------------------------------- | ---------------------------- |
| `references/catalog.md`          | The models, prices, removed list, and verification | Choosing or auditing a model |
| `references/routing-table.md`    | Difficulty classification and the full table       | Classifying a task           |
| `references/ladder-and-specs.md` | Attempts, failure signals, and the spec template   | A delegation failed          |
| `references/adjudication.md`     | Verification, spot checks, and cost extraction     | Accepting a delegated result |
