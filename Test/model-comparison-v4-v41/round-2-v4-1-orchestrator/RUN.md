# Round 2 - v4.1 Orchestrator

The same task, this time from the v4.1 perspective: the harness main agent
IS deepseek-v4.1-flash-1017 (the `agent-default-model` was flipped, harness
restarted). It launches TWO subagents on the SAME task - one on
deepseek-v4-flash-0731, one on deepseek-v4.1-flash-1017.

## Preconditions

- `agent-default-model` in `~/.dsh/profiles/desktop/cordis.patch.yml` is
  flipped to `model: "@cf/deepseek-ai/deepseek-v4.1-flash-1017"` and the
  harness was RESTARTED with no active subagents.
- The main session now runs on deepseek-v4.1-flash-1017 at max; confirm the
  conversation header / settings show the new default before launching.
- Verify the route catalog with `list_subagent_models` as in round 1.

## The two launches

Same routing contract as round 1 (user override, both models at `max`,
identical prompt and spec):

| | Subagent A (worker-v4) | Subagent B (worker-v4-1) |
|---|---|---|
| provider | `cloudflare-workers-ai` | `cloudflare-workers-ai` |
| model | `@cf/deepseek-ai/deepseek-v4-flash-0731` | `@cf/deepseek-ai/deepseek-v4.1-flash-1017` |
| reasoning_effort | `max` | `max` |
| prompt | CODING-PROMPT.md, RESULTS_DIR = `round-2-v4-1-orchestrator/results/subagent-v4` | CODING-PROMPT.md, RESULTS_DIR = `round-2-v4-1-orchestrator/results/subagent-v4-1` |
| spec | `task/TASK.md` (same for both) | `task/TASK.md` (same for both) |

Launch both in one message, explicit triple on each `subagent` call.

## Adjudication (parent, after both finish)

Identical protocol to round 1 (REPORT.md verdicts, `node test/run.js`
totals, one beyond-spec adversarial edge, cost extraction from session
logs priced at both rates). Write `results/ROUND-2-SUMMARY.md`.

## After the round

Write the consolidated `results/COMPARISON.md` at the experiment root:
the 4x4 matrix (orchestrator x worker), verdicts, test totals, adversarial
outcomes, token counts, and costs at catalog rates. Then report to the
user with a recommendation for the deepseek lane's primary/fallback order
and whether the `planner` pin in `agent-loop` should move - the user
commits; agents never commit.