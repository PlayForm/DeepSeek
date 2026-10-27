# model-comparison-v4-v41

The v4-vs-v4.1 comparison archive (started 2026-10-20) puts deepseek-v4-flash-0731 against
deepseek-v4.1-flash-1017, with each model in BOTH roles (orchestrator and worker) on ONE shared coding
task. Four runs exist in total, and all are adjudicated.

## The matrix

| Run | Orchestrator (main agent) | Worker model | Results folder |
|---|---|---|---|
| 1A | deepseek-v4-flash-0731 | deepseek-v4-flash-0731 | `round-1-v4-orchestrator/results/subagent-v4` |
| 1B | deepseek-v4-flash-0731 | deepseek-v4.1-flash-1017 | `round-1-v4-orchestrator/results/subagent-v4-1` |
| 2A | deepseek-v4.1-flash-1017 | deepseek-v4-flash-0731 | `round-2-v4-1-orchestrator/results/subagent-v4` |
| 2B | deepseek-v4.1-flash-1017 | deepseek-v4.1-flash-1017 | `round-2-v4-1-orchestrator/results/subagent-v4-1` |

- **Task**: the Markdown Table Normalizer CLI in `task/TASK.md` (the canonical spec, identical for
  every run).
- **Prompt**: `task/CODING-PROMPT.md`, the general coding prompt template, where the orchestrator
  substitutes `{{RESULTS_DIR}}` + `{{TASK_SPEC_PATH}}` and pastes it verbatim.
- **Routing**: the user override for this experiment - provider `cloudflare-workers-ai` with
  `reasoning_effort: max` on both models (a fair comparison, because the standing policy would route
  this routine coding to glm-5.3-flash high).

## Restart protocol (config changes require restarts, no live edits)

1. **Now (done)**: the model is registered in `~/.dsh/profiles/desktop/cordis.patch.yml`
   (`llm-pi-ai.models` + `allowedModels`), and the global skills (task-routing, worker-strains,
   harness-observability) and their repo copies now carry the 3-model catalog with prices
   ($0.15/$0.50/$0.03 GLM, $0.30/$1.20/$0.006 v4.1, $0.44/$1.32/$0.044 v4) and the
   primary/fallback framing of the deepseek lane.
2. **Round 1**: restart the harness (the main agent stays deepseek-v4-flash-0731), follow
   `round-1-v4-orchestrator/RUN.md`, launch 1A + 1B in one message, adjudicate, and write
   `ROUND-1-SUMMARY.md`.
3. **Round 2**: flip `agent-default-model` in the patch to
   `@cf/deepseek-ai/deepseek-v4.1-flash-1017`, restart, follow
   `round-2-v4-1-orchestrator/RUN.md`, launch 2A + 2B, adjudicate, and write `ROUND-2-SUMMARY.md`.
4. **Compare**: consolidate into `results/COMPARISON.md` - verdicts, test totals, beyond-spec
   adversarial outcomes, token counts, and costs at catalog rates (extract `data.usage` from
   `~/.dsh/sessions/`). The outcome settles the primary/fallback order of the deepseek lane and whether
   the `agent-loop` `planner` pin moves. The user commits, and agents never commit.

## Pricing reference (per 1M tokens, USD)

| Model | Input | Output | Cached | Context |
|---|---|---|---|---|
| `@cf/zai-org/glm-5.3-flash` | $0.15 | $0.50 | $0.03 | 1,048,576 |
| `@cf/deepseek-ai/deepseek-v4.1-flash-1017` | $0.30 | $1.20 | $0.006 | 1,048,576 |
| `@cf/deepseek-ai/deepseek-v4-flash-0731` | $0.44 | $1.32 | $0.044 | 1,048,576 |

v4.1 is cheaper on every axis (input -32%, output -9%, cached -86%), so the comparison decides whether
it also matches or beats v4 on correctness and orchestration quality.
