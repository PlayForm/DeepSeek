# @playform/ets-hook-dsh-normalize-fullwidth - The fullwidth normalizer for model output

> Version 0.1.0 - UNPUBLISHED (the npm bootstrap tier 2-planned / 3-candidates). Plan: the
> [factory README](../ets-plugin-dsh-factory/README.md), the
> [core README](../ets-lib-dsh-core/README.md), and the
> [llm/stream](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts)
> reference.

## The role

The **fullwidth normalizer for model output** - a DeepSeek Harness plugin that hooks the
[`llm/stream`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts)
waterfall (the interceptable wrapper around EVERY streaming model call, bound to the LlmRuntime) and
normalizes the full-width family in model output, live in the transcript: the entire FULLWIDTH FORMS
range U+FF01-U+FF5E maps to its ASCII half-width counterpart U+0021-U+007E - the whole story,
letters, punctuation and digits included. A **MAP flavor** of the normalize family: the core's
`Fullwidth` char-to-char table owns the substitution - no `replacement` config knob. The @-sentence
identity: **Hook @ DSH @ Normalize @ Fullwidth**. The family's `raw-write` tool (registered by
[ets-hook-dsh-normalize-dash](../ets-hook-dsh-normalize-dash)) bypasses this flavor's transforms too

- the exemption is family-wide, so the tool's explicit `normalize` parameter (default false =
  verbatim) is the only normalization it applies. Unlike the governance family, the rewrite flows
  into both the live UI and the durable transcript - the normalization is deliberately **VISIBLE; it
  IS the feature**. The shared Effect-TS plumbing - the runtime wiring, the stream machinery, the
  `Activate`/`Append` ledger composer and the generic `normalize-overpass` handler - comes from the
  base [ets-base-dsh](../ets-base-dsh) package.

## The surfaces

| Kind           | Name               | What                                                                                                                              |
| -------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| listener       | llm/stream         | normalizes the full-width family live in the transcript (text/reasoning deltas, assembled block-end blocks, tool arguments gated) |
| listener       | tools/post-execute | overpass arm, opt-in via scopes.toolResults (prepended, outermost vs the ccr gate)                                                |
| listener       | agent/pre-step     | overpass arm, opt-in via scopes.batch                                                                                             |
| config/command | normalize-overpass | arms the one-shot batch overpass, flips scopes.toolResults, reports the scopes - the files sweep is declined                      |

## The configuration

| Field                    | Type     | Default                                                                                        | Meaning                                                                                                                                        |
| ------------------------ | -------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `log`                    | boolean  | `true`                                                                                         | write the durable ledger file (volatile)                                                                                                       |
| `logFile`                | string   | `~/.dsh/playform/hook-dsh-normalize-fullwidth.log`                                             | the normalize-fullwidth ledger (volatile)                                                                                                      |
| `normalizeReasoning`     | boolean  | `true`                                                                                         | normalize reasoning deltas and the assembled reasoning block too                                                                               |
| `normalizeToolArguments` | boolean  | `false`                                                                                        | rewrite the tool-call argumentsDelta and the assembled ToolCallBlock.arguments when on - execution-critical raw JSON, the user's accepted risk |
| `scopes`                 | object   | see below                                                                                      | gates every arm independently; the whole object is volatile                                                                                    |
| `scopes.conversation`    | boolean  | `true`                                                                                         | text-delta text + the assembled text/reasoning blocks                                                                                          |
| `scopes.reasoning`       | boolean  | `true`                                                                                         | the reasoning-delta sub-gate (ANDed with `normalizeReasoning`)                                                                                 |
| `scopes.toolInput`       | boolean  | `false`                                                                                        | the tool-call arguments arm (OR-ed with `normalizeToolArguments`)                                                                              |
| `scopes.toolResults`     | boolean  | `false`                                                                                        | the tools/post-execute arm                                                                                                                     |
| `scopes.files`           | boolean  | `true`                                                                                         | inert in a stream flavor (present so one patch override drives the whole family)                                                               |
| `scopes.batch`           | boolean  | `false`                                                                                        | the agent/pre-step arm                                                                                                                         |
| `toolResultsExempt`      | string[] | `read`, `edit`, `raw-write`, `normalize-file`, `ccr_retrieve`, `subagent`, `ask_user_question` | a tool result whose exec name is listed passes the tool-results arm by identity (volatile)                                                     |

The module composes the factory helper with `shared: false`, so the shared block is only `log` and
`logFile`; the module's own fields follow in schema order. There is no `replacement` field: this is
a MAP flavor - the substitution is the core's `Fullwidth` char-to-char table.

## The ledger

```text
hook-dsh-normalize-fullwidth: activated (reasoning=on, toolArgs=off, logFile=~/.dsh/playform/hook-dsh-normalize-fullwidth.log)
hook-dsh-normalize-fullwidth: normalized N fullwidth char(s) in one stream
hook-dsh-normalize-fullwidth: overpass: normalized N char(s) in tool result <toolName> <callId>
hook-dsh-normalize-fullwidth: overpass: normalized N char(s) in step batch (turn T step S)
```

The activation line is written by `apply()`; the count line and the overpass lines only appear on a
normal completion / an N > 0 pass (N = 0 is a true no-op - no ledger line; a thrown-away stream
writes no line). The `hook-dsh-normalize-fullwidth: ` prefix is the `<State.Module>:` identity the
factory's `Append` composes - the Classic identity, kept byte-identical across the two variants.

## The build and the tests

- Build:
  `pnpm --config.verify-deps-before-run=false --dir EffectTS/packages/ets-hook-dsh-normalize-fullwidth run prepublishOnly`
- Smokes: `node EffectTS/packages/ets-hook-dsh-normalize-fullwidth/Target/Test/<Folder>/Test.js`
    - Config-And-State - 14 checks
    - Overpass - 34 checks
    - Runs - 23 checks
    - Scopes - 8 checks
    - Stream-Contract - 25 checks

## The plan

The family position and the factory contract are documented in the
[ets-plugin-dsh-factory](../ets-plugin-dsh-factory) and [ets-lib-dsh-core](../ets-lib-dsh-core)
READMEs, and the hook point is the
[llm/stream](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts)
waterfall of the LlmRuntime; the bundle is configured through its
[cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/ets-hook-dsh-normalize-fullwidth/cordis.patch.yml)
row, and the shared Effect-TS plumbing is the base [ets-base-dsh](../ets-base-dsh) package.
