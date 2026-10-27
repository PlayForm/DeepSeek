# Round 1 - v4 Orchestrator

The harness main agent IS deepseek-v4-flash-0731 (`agent-default-model`), and this round runs it as
the orchestrator: it launches TWO subagents on the SAME task, one on deepseek-v4-flash-0731 and one on
deepseek-v4.1-flash-1017.

## Preconditions

- The harness restarted AFTER the 2026-10-20 config change, where the desktop profile patch now
  registers deepseek-v4.1-flash-1017 in `llm-pi-ai.models` and in
  `subagent-model-selection-settings.allowedModels`.
- No active subagents, because the launches of this round are the first of the session.
- Verify first with `list_subagent_models` (no args): the cloudflare-workers-ai provider must
  advertise all three models, then confirm `deepseek-v4.1-flash-1017` and its efforts
  (none/low/high/max) with the provider+model call.

## The two launches

The routing is a USER OVERRIDE for this experiment, where both models execute the same coding task at
the same effort for a fair comparison, because the standing policy would otherwise route this routine
coding to glm-5.3-flash high.

| | Subagent A (worker-v4) | Subagent B (worker-v4-1) |
|---|---|---|
| provider | `cloudflare-workers-ai` | `cloudflare-workers-ai` |
| model | `@cf/deepseek-ai/deepseek-v4-flash-0731` | `@cf/deepseek-ai/deepseek-v4.1-flash-1017` |
| reasoning_effort | `max` | `max` |
| prompt | CODING-PROMPT.md, RESULTS_DIR = `round-1-v4-orchestrator/results/subagent-v4` | CODING-PROMPT.md, RESULTS_DIR = `round-1-v4-orchestrator/results/subagent-v4-1` |
| spec | `task/TASK.md` (same for both) | `task/TASK.md` (same for both) |

Launch them in the same message (parallel), and each `subagent` call passes provider/model/
reasoning_effort EXPLICITLY, with no inheritance and no defaults.

## Adjudication (parent, after both finish)

1. For each run, read the REPORT.md verdict line and then verify yourself with `node test/run.js`
   from the results folder, using the printed suite totals and not prose (never spend LLM tokens on
   verification, because shell checks are free).
2. Run at least one adversarial edge BEYOND the list of the spec (e.g. a table with a `|` inside a
   link title, or a 30-column table) and record the outcome.
3. Extract the cost from the session logs (`~/.dsh/sessions/...`, `data.usage`: inputTokens /
   outputTokens / cacheReadTokens) and price each run at BOTH catalog rates of the models
   ($0.44/$1.32/$0.044 for v4, $0.30/$1.20/$0.006 for v4.1), because the comparison reports both.
4. Write the findings of the round into `results/ROUND-1-SUMMARY.md`: verdicts, test totals,
   adversarial outcomes, token counts, costs.

## After the round

Report to the user, then prepare Round 2: flip `agent-default-model` in
`~/.dsh/profiles/desktop/cordis.patch.yml` to `@cf/deepseek-ai/deepseek-v4.1-flash-1017` and RESTART
the harness with no active subagents, because config changes require a restart and no live edits.
