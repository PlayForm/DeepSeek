# The Model Catalog (Exactly 3 Models - Do Not Invent Others)

> Source: SKILL.md, section 1 "Model catalog". Includes the removed
> models with their removal reasons (verified dates kept verbatim).
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The catalog contains exactly three models. These are the only models that
may be requested:

| Model ID (exact)                         | Input $/1M | Output $/1M | Cached $/1M | Context |
| ---------------------------------------- | ---------- | ----------- | ----------- | ------- |
| `@cf/zai-org/glm-5.3-flash`              | $0.15      | $0.50       | $0.03       | 1M      |
| `@cf/deepseek-ai/deepseek-v4.1-flash-1017` | $0.30    | $1.20       | $0.006      | 1M      |
| `@cf/deepseek-ai/deepseek-v4-flash-0731` | $0.44      | $1.32       | $0.044      | 1M      |

> Context: 1M = 1,048,576 tokens, the enforced "maximum context length"
> verified 2026-10-03 against the live Workers AI endpoint (the earlier
> 1,310,720 projection was wrong - see the profile config comments).
> deepseek-v4.1-flash-1017 (added 2026-10-20): vision + function calling,
> reasoning `none`/`low`/`high`/`max`; it is the DeepSeek lane's primary -
> cheaper than 0731 on every axis (input -32%, output -9%, cached -86%).
> The 2026-10-20 v4-vs-v4.1 comparison (Test/model-comparison-v4-v41)
> decides whether the primary/fallback order holds.

**Removed models - never request these, they are not in the catalog:**

- `@cf/qwen/qwen3-30b-a3b-fp8` - 32k context; VERIFIED (2 runs,
  2026-10-02) to die with `400 INVALID_REQUEST` (context overflow) after
  a few tool calls in any agentic loop. Unusable for subagent work.
  Removed entirely.
- `@cf/deepseek-ai/deepseek-v4-pro-0813`, `@cf/moonshotai/kimi-k2.6`,
  `@cf/moonshotai/kimi-k2.7-code`, `@cf/zai-org/glm-5.2`,
  `@cf/zai-org/glm-5.3`, `@cf/qwen/qwen3.8-27b` - removed for cost
  (anything >= $0.95/M input or $3.20/M output).
- `@cf/zai-org/glm-4.7-flash` - removed after losing the 2026-09
  exploration comparison (hallucinated structure, mojibake).

## Why: The Full Philosophy

1. **A three-model catalog is a deliberate chokepoint.** With exactly
   three options - a cheap fast model (GLM 5.3 Flash) and two DeepSeek
   reasoning models (V4.1 Flash 1017, V4 Flash 0731) - every routing
   decision reduces to "which lane, which model, and at which effort".
   More options would multiply decision surface for no measured gain
   (correctness across efforts is identical in the benchmarks; see
   ./references/benchmark-evidence.md).
2. **Pricing drives the split.** GLM 5.3 Flash at $0.15/M input,
   $0.50/M output, $0.03/M cached is the volume lane; the DeepSeek lane
   (V4.1 Flash 1017 at $0.30 / $1.20 / $0.006, V4 Flash 0731 at
   $0.44 / $1.32 / $0.044) is reserved for planning and the escalation
   ceiling where its reasoning depth is actually needed. V4.1 Flash 1017
   is cheaper than 0731 on every axis (input -32%, output -9%, cached
   -86%) and is the lane's primary; 0731 remains the fallback and the
   current `agent-default-model` until the 2026-10-20 comparison
   concludes. All three carry 1M (1,048,576) context, so context never
   forces a model choice.
3. **The removed list is a memorial, not trivia.** Each entry records
   WHY the model left:
   - qwen3-30b-a3b-fp8: a functional failure, not a preference - 32k
     context overflows after a few tool calls in any agentic loop,
     verified twice on 2026-10-02 with `400 INVALID_REQUEST`. Requesting
     it is not suboptimal, it is broken.
   - deepseek-v4-pro-0813, kimi-k2.6, kimi-k2.7-code, glm-5.2, glm-5.3,
     qwen3.8-27b: cost removals - anything at or above $0.95/M input or
     $3.20/M output does not clear the benchmark economics.
   - glm-4.7-flash: quality removal - it lost the 2026-09 exploration
     comparison on observable defects (hallucinated structure, mojibake).
4. **"Do not invent others" is literal.** A model id that is not in the
   table above is not permitted, even if an LLM provider catalog
   advertises it. The profile patch `allowedModels` is the enforcement
   point (see ./references/non-negotiables.md).

## Examples

### Good

- Route: `@cf/zai-org/glm-5.3-flash` at `low` for a repo survey.
- Route: `@cf/deepseek-ai/deepseek-v4.1-flash-1017` at `max` for
  architecture planning (the lane's primary, added 2026-10-20).
- Route: `@cf/deepseek-ai/deepseek-v4-flash-0731` at `max` for
  architecture planning (the lane's fallback / current default).
- Quoting a price from the table ("$1.20/M output") when estimating a
  delegation's cost.

### Bad

- "I'll try `glm-5.2` since it's close to 5.3" - removed for cost.
- "deepseek-v4.1-flash" without the `-1017` suffix - not the exact id,
  rejected or silently unmatched (always copy the exact id).
- "kimi-k2.7-code sounds perfect for coding" - removed for cost.
- Retrying `qwen3-30b-a3b-fp8` with a shorter prompt to "fit in 32k" -
  the model is unusable for agentic loops regardless of prompt size.
- Inventing a hypothetical `glm-6` id because the runtime suggested it
  - not in the catalog, not allowed.

## Exceptions

- None inside the skill. The user's explicit override (non-negotiable 3)
  can name a model for a task; even then, off-catalog ids should be
  flagged to the user against the removed list before use.

## Failure Modes

- **Catalog drift by memory**: routing to a model remembered from an
  older policy version (e.g. `glm-5.3` non-flash). Cost: either a cost
  regression or, for qwen, outright 400 failures.
- **Ignoring the removal reasons**: treating the removed list as
  historical and re-proposing a removed model for a "special case".
  Cost: repeats a verified failure (qwen) or a verified quality loss
  (glm-4.7-flash mojibake).
- **Typo'd ids**: `deepseek-v4-flash` without `-0731`. Cost: request
  rejected or silently unmatched; always copy the exact id from the
  table.

## Arbiters

- Profile check: `allowedModels` in the
  `subagent-model-selection-settings` patch must equal exactly these
  three model ids; any request outside it is rejected by policy before
  it can fail at the provider.
- Session-log audit: the model id recorded in each subagent's session
  log (see ./references/adjudication-protocol.md) must appear in the
  table above.
