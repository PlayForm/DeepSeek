---
name: task-routing
description:
    "The model-routing policy for every delegation: the three-model catalog, difficulty-first
    classification, closed routing table, attempts ladder, spec requirements, and the adjudication
    protocol that makes cheap exploration safe."
whenToUse:
    Before every subagent call, workflow agent() call, or any decision about which model and
    reasoning effort to use; also when a delegation fails and you must decide whether to retry or
    escalate.
version: 2.2.0
updated: 2026-10-25
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
- When a delegation fails and the next step is a retry, an escalation, or a stop.
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
5. **The table is closed.** A delegation that fits no row is classified by the tie-breaker, never by
   a new row. Inventing a row ("sensitive exploration", "DeepSeek high") is a policy change and a
   cost incident, not a judgment call.

## The user's override (2026-10-25)

The user rejected high-effort editing lanes: they did small edits at `high` and the effort was
wasted. For this profile, break every piece of work into small, mechanical, self-contained specs and
run EVERY editing lane at GLM `low`. The parent does the splitting - exact files, exact edits, exact
expected values - so the cheap lane executes rather than judges. Many small lanes is the default;
one large high lane is not. `high` and `max` are used only when the user asks for them by name.

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

Classify by what the operation demands, not by the task's label, its file count, or its stakes:

- **Mechanical**: a complete spec, no ambiguity, lookup-and-replace, renames, conversions, a guarded
  exceptions list. File count does not raise the tier.
- **Semantic**: naming judgment, authored prose, ambiguous refactors, integration, or the
  implementation of a design the parent has ALREADY specified.
- **Constitutive**: the design itself, the architecture, the plan, the adjudication. That is the
  parent's own lane, never a delegated one.

The critical distinction: **the design belongs to the parent; the implementation of a specified
design is coding, not design.** A lane handed a detailed spec (the interfaces, the file layout, the
contracts) is doing semantic coding, not architecture, even when the change is large or novel.

## The routing table (closed)

| Task class                                                 | Model                      | Effort          |
| ---------------------------------------------------------- | -------------------------- | --------------- |
| Exploration, any, always                                   | `glm-5.3-flash`            | `low`           |
| Coding, mechanical (a complete spec)                       | `glm-5.3-flash`            | `low`           |
| Coding, semantic (the design is given by the parent)       | `glm-5.3-flash`            | `high`          |
| Coding, exhaustive verification (an explicit user request) | `glm-5.3-flash`            | `max`           |
| The parent's planning, architecture, design, adjudication  | `deepseek-v4.1-flash-1017` | `max`           |
| The delegated red-tree diagnosis or advanced debugging     | `deepseek-v4.1-flash-1017` | `max`           |
| The fallback, only when the cheap route is NOT permitted   | `deepseek-v4.1-flash-1017` | the SAME effort |

**There is no DeepSeek `high` row.** The semantic coding lane runs on the GLM at `high`; the
DeepSeek lane appears at `max` (the planning, the design, the advanced debugging) and as the
same-effort fallback when the cheap route is unavailable. A DeepSeek `high` delegation is a row
invention: it pays 2x the input and 2.4x the output for a correctness gain the table does not
predict.

The main agent runs the DeepSeek lane at `max`; its current default is `deepseek-v4.1-flash-1017`.
Planning is never delegated to the GLM tier.

## The calibration (2026-10-24)

The first full program run under this policy was audited and over-routed:

- 11 lanes on GLM `low` (the sweeps, the enables, the docs) - correct, every one succeeded on the
  first attempt.
- 24 lanes on DeepSeek `high` - per this table, 16 of them were semantic coding (the suggesters, the
  graph, the batch chain, the trace bus, the pack layer, the storage migration, the learner, the
  client family, the policy blocks, ...) and 4 were mechanical (the type mirror, the integration
  fixes, the profile surface, the final green verification). All were over-routed by one tier or one
  model; the red-tree diagnosis alone justified the DeepSeek lane (at `max`, not `high`).
- 4 durable teammates ran on the `spawn_teammate` default (the DeepSeek lane) because the tool has
  no route field.

The root cause: the fallback clause ("if the cheap route is not permitted, use DeepSeek at the same
effort") was read as a license while the cheap route WAS permitted, and the semantic judgment tier
was then mapped to the DeepSeek model. The fix, now binding: the cheap route is permitted unless the
profile forbids it, and the semantic judgment tier is the GLM at `high`.

## The Agent Teams caveat

`spawn_teammate` carries no `provider`/`model`/`reasoning_effort` fields: a durable teammate runs on
the profile's subagent default, which is the expensive lane. When the work is a routed lane
(mechanical or semantic coding, exploration), use `subagent`/`subagent_fork` with the explicit
triple. When the work needs the durable, messageable room, spawn the teammate and record that it
runs on the default; do not describe it as a cheap lane.

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
4. The route the lane is running on (the model and the effort), stated in the prompt, so the lane's
   report can echo it.

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
6. **The route audit:** every accepted lane's report states the route it ran on; a lane whose route
   does not match its class is an over-routing incident, recorded and corrected on the next
   dispatch - never silently absorbed.

## Verification

- Every delegation in the transcript carries the explicit triple.
- The model ids match the catalog exactly, including suffixes.
- A failed task shows at most three attempts.
- Each accepted result has a logged parent verification.
- No delegation uses a row the table does not contain.

## Anti-patterns

| Mistake                                                 | Cost                                      | Do instead                                                  |
| ------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| Omitting the route                                      | Inherits the expensive lane; unauditable  | Pass provider, model, effort                                |
| Sending exploration to DeepSeek                         | 5.8x cost for identical correctness       | GLM at `low`                                                |
| Calling a mechanical sweep "routine"                    | Pays `high` for no gain                   | Difficulty first                                            |
| The DeepSeek `high` for semantic coding (row invention) | 2x input, 2.4x output, no gain            | GLM at `high`                                               |
| Treating a specified implementation as "design"         | Sends the coding to the DeepSeek lane     | The design is the parent's; the coding is the GLM           |
| Self-authorizing coding `max`                           | 6.4x cost for identical correctness       | Only on explicit user request                               |
| Escalating without artifacts                            | Reproduces the failure                    | Pass the failure state                                      |
| A teammate room as the default route                    | The room silently runs the expensive lane | Route the lanes via `subagent`; record the teammate default |
| LLM re-review of a report                               | Destroys the economics                    | Shell checks only                                           |

## References

| File                             | Covers                                                       | Read when                    |
| -------------------------------- | ------------------------------------------------------------ | ---------------------------- |
| `references/catalog.md`          | The models, prices, removed list, and verification           | Choosing or auditing a model |
| `references/routing-table.md`    | Difficulty classification, the closed table, the calibration | Classifying a task           |
| `references/ladder-and-specs.md` | Attempts, failure signals, and the spec template             | A delegation failed          |
| `references/adjudication.md`     | Verification, spot checks, and cost extraction               | Accepting a delegated result |
