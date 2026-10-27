# @playform/ets-hook-dsh-normalize-quotes - The quotes normalizer for model output

> Version 0.1.0 - UNPUBLISHED (the npm bootstrap tier 2-planned / 3-candidates).
>
> Plan: the [factory README](../ets-plugin-dsh-factory/README.md), the
> [core README](../ets-lib-dsh-core/README.md), and the
> [llm/stream](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts)
> reference.

## The role

The **quote normalizer for model output** is a DeepSeek Harness plugin that hooks the
[`llm/stream`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts)
waterfall and normalizes the curly quote family in model output, live in the transcript.

The waterfall is the interceptable wrapper around EVERY streaming model call, bound to the
LlmRuntime.

The eight typographic quote code points each map to their ASCII straight counterpart:
U+2018/U+2019/U+201A/U+201B to the ASCII apostrophe, and U+201C/U+201D/U+201E/U+201F to the ASCII
double quote.

A **MAP flavor** of the normalize family: the `Quotes` char-to-char table of the core owns the
substitution, and there is no `replacement` config knob.

The @-sentence identity: **Hook @ DSH @ Normalize @ Quotes**.

The `raw-write` tool of the family (registered by
[ets-hook-dsh-normalize-dash](../ets-hook-dsh-normalize-dash)) bypasses the transforms of this
flavor too.

The exemption is family-wide, so the explicit `normalize` parameter of the tool (default false =
verbatim) is the only normalization it applies.

Unlike the governance family, the rewrite flows into both the live UI and the durable transcript,
because the normalization is deliberately **VISIBLE; it IS the feature**.

The shared Effect-TS plumbing comes from the base [ets-base-dsh](../ets-base-dsh) package: the
runtime wiring, the stream machinery, the `Activate`/`Append` ledger composer, and the generic
`normalize-overpass` handler.

## The surfaces

| Kind           | Name               | What                                                                                                                               |
| -------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| listener       | llm/stream         | normalizes the curly quote family live in the transcript (text/reasoning deltas, assembled block-end blocks, tool arguments gated) |
| listener       | tools/post-execute | overpass arm, opt-in via scopes.toolResults (prepended, outermost vs the ccr gate)                                                 |
| listener       | agent/pre-step     | overpass arm, opt-in via scopes.batch                                                                                              |
| config/command | normalize-overpass | arms the one-shot batch overpass, flips scopes.toolResults, reports the scopes - the files sweep is declined                       |

## The configuration

| Field                    | Type     | Default                                                                                        | Meaning                                                                                                                                        |
| ------------------------ | -------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `log`                    | boolean  | `true`                                                                                         | write the durable ledger file (volatile)                                                                                                       |
| `logFile`                | string   | `~/.dsh/playform/hook-dsh-normalize-quotes.log`                                                | the normalize-quotes ledger (volatile)                                                                                                         |
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
`logFile`.

The own fields of the module follow in schema order.

There is no `replacement` field: this is a MAP flavor, and the substitution is the `Quotes`
char-to-char table of the core.

## The ledger

```text
hook-dsh-normalize-quotes: activated (reasoning=on, toolArgs=off, logFile=~/.dsh/playform/hook-dsh-normalize-quotes.log)
hook-dsh-normalize-quotes: normalized N quote char(s) in one stream
hook-dsh-normalize-quotes: overpass: normalized N char(s) in tool result <toolName> <callId>
hook-dsh-normalize-quotes: overpass: normalized N char(s) in step batch (turn T step S)
```

The activation line is written by `apply()`.

The count line and the overpass lines only appear on a normal completion or an N > 0 pass, because N
= 0 is a true no-op with no ledger line and a thrown-away stream writes no line.

The `hook-dsh-normalize-quotes: ` prefix is the `<State.Module>:` identity that `Append` of the
factory composes: the Classic identity, kept byte-identical across the two variants.

## The build and the tests

- Build:
  `pnpm --config.verify-deps-before-run=false --dir EffectTS/packages/ets-hook-dsh-normalize-quotes run prepublishOnly`
- Smokes: `node EffectTS/packages/ets-hook-dsh-normalize-quotes/Target/Test/<Folder>/Test.js`
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
waterfall of the LlmRuntime.

The bundle is configured through its
[cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/ets-hook-dsh-normalize-quotes/cordis.patch.yml)
row, and the shared Effect-TS plumbing is the base [ets-base-dsh](../ets-base-dsh) package.
