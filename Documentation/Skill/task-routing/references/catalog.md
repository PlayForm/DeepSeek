# The Model Catalog

Three models. Every delegation uses one of them, with the exact id.

| Model id                                  | Input $/1M | Output $/1M | Cached $/1M | Context |
| ----------------------------------------- | ---------: | ----------: | ----------: | ------: |
| `@cf/zai-org/glm-5.3-flash`               |       0.15 |        0.50 |        0.03 |      1M |
| `@cf/deepseek-ai/deepseek-v4.1-flash-1017`|       0.30 |        1.20 |       0.006 |      1M |
| `@cf/deepseek-ai/deepseek-v4-flash-0731`  |       0.44 |        1.32 |       0.044 |      1M |

Provider: `cloudflare-workers-ai`. Context: 1M = 1,048,576 tokens.

## Roles

- **GLM 5.3 Flash** - the volume lane: exploration, mechanical work, routine
  coding. Cheap, fast, and adequate for work whose result the parent
  verifies with free shell checks.
- **DeepSeek V4.1 Flash 1017** - the reasoning lane's primary: planning,
  architecture, advanced debugging, the escalation ceiling. Cheaper than
  0731 on every axis (input -32%, output -9%, cached -86%).
- **DeepSeek V4 Flash 0731** - the reasoning lane's fallback, used when the
  primary is unavailable or when a comparison names it.

The main agent itself runs the DeepSeek lane at `max`; its current default
is `deepseek-v4.1-flash-1017`.

## Removed models (never request)

| Model                              | Why removed                                            |
| ---------------------------------- | ------------------------------------------------------ |
| `@cf/qwen/qwen3-30b-a3b-fp8`       | 32k context; 400 INVALID_REQUEST in agentic loops      |
| `@cf/deepseek-ai/deepseek-v4-pro-0813` | Cost (>= $0.95/M input or $3.20/M output)          |
| `@cf/moonshotai/kimi-k2.6`         | Cost                                                   |
| `@cf/moonshotai/kimi-k2.7-code`    | Cost                                                   |
| `@cf/zai-org/glm-5.2`              | Cost                                                   |
| `@cf/zai-org/glm-5.3`              | Cost                                                   |
| `@cf/qwen/qwen3.8-27b`             | Cost                                                   |
| `@cf/zai-org/glm-4.7-flash`        | Lost the 2026-09 exploration comparison (hallucinated structure, mojibake) |

A model id not in the table above is not permitted, even if a provider
catalog advertises it. The `allowedModels` entry in the profile's
`subagent-model-selection-settings` patch is the enforcement point.

## Verification and refresh

Verify the live catalog:

```text
list_subagent_models()
```

Verify the profile's allowlist: the `allowedModels` array in the profile
patch must contain exactly the three ids above.

Prices and model ids drift. When a price or a model changes, update this
file and the profile patch in the same change set, and record the date in
the change. Do not copy the table into another skill; point here.

## Failure modes

- **Catalog by memory.** Routing to `glm-5.3` (no `-flash`) or
  `deepseek-v4-flash` (no `-0731`) - rejected or silently unmatched.
- **Removal amnesia.** Re-proposing a removed model for a "special case" -
  repeats a verified failure.
- **Allowlist drift.** More or fewer than three entries in
  `allowedModels` - the guard no longer matches the policy.
