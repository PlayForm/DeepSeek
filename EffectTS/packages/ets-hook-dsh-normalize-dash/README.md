# @playform/ets-hook-dsh-normalize-dash - The dash normalizer for model output

> Version 0.1.0 - UNPUBLISHED (the npm bootstrap tier 2-planned / 3-candidates).
>
> Plan: [SCHEME.md](./SCHEME.md), the [factory README](../ets-plugin-dsh-factory/README.md), the
> [core README](../ets-lib-dsh-core/README.md), and the
> [llm/stream](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts)
> reference.

## The role

The **dash normalizer for model output**: a DeepSeek Harness plugin that hooks the
[`llm/stream`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts)
waterfall (the interceptable wrapper around EVERY streaming model call, bound to the LlmRuntime) and
normalizes the unicode dash family to ASCII hyphen-minus, live in the transcript.

Em dashes, en dashes and seventeen exotic relatives become `-`.

It is a **CLASS flavor** of the normalize family: the `Dashes` class of the core plus a configurable
`replacement` (default `-`).

The plugin also registers the family's **`raw-write` tool**: a write wrapper with an explicit
`normalize` parameter (default **false = verbatim**), exempt from the stream normalization by name
like `edit`.

The @-sentence identity: **Hook @ DSH @ Normalize @ Dash**.

Unlike the governance family, the rewrite flows into both the live UI and the durable transcript,
because the normalization is deliberately **VISIBLE; it IS the feature**, which is why the injection
point was chosen.

The shared Effect-TS plumbing (the runtime wiring, the stream machinery, the `Activate`/`Append`
ledger composer and the generic `normalize-overpass` handler) comes from the base
[ets-base-dsh](../ets-base-dsh) package.

## The surfaces

| Kind           | Name               | What                                                                                                                                |
| -------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| listener       | llm/stream         | normalizes the unicode dash family live in the transcript (text/reasoning deltas, assembled block-end blocks, tool arguments gated) |
| tool           | raw-write          | the write wrapper with the normalize + govern parameters, exempt from stream normalization by name                                  |
| listener       | tools/post-execute | overpass arm, opt-in via scopes.toolResults (prepended, outermost vs the ccr gate)                                                  |
| listener       | agent/pre-step     | overpass arm, opt-in via scopes.batch                                                                                               |
| config/command | normalize-overpass | arms the one-shot batch overpass, flips scopes.toolResults, reports the scopes - the files sweep is declined                        |

## The configuration

| Field                    | Type     | Default                                                                                        | Meaning                                                                                                                                        |
| ------------------------ | -------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `log`                    | boolean  | `true`                                                                                         | write the durable ledger file (volatile)                                                                                                       |
| `logFile`                | string   | `~/.dsh/playform/hook-dsh-normalize-dash.log`                                                  | the normalize-dash ledger (volatile)                                                                                                           |
| `replacement`            | string   | `-`                                                                                            | the transform's only knob - hot-editable, the next stream picks it up with no remount (volatile)                                               |
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
`logFile`, and the own fields of the module follow in schema order.

The `normalize` parameter of `raw-write` (absent or false = verbatim, `true`/`"all"` = all six
transforms in the fixed order of the family, or an array of flavor names = only the selected
flavors) and its `govern` parameter (absent or false = no governance chain, `true`/`"all"` = all
registered steps for the basename of the target, or named steps only) are per-call tool parameters
and not config fields.

## The ledger

```text
hook-dsh-normalize-dash: activated (replacement=-, reasoning=on, toolArgs=off, logFile=~/.dsh/playform/hook-dsh-normalize-dash.log)
hook-dsh-normalize-dash: normalized N dash char(s) in one stream
hook-dsh-normalize-dash: overpass: normalized N char(s) in tool result <toolName> <callId>
hook-dsh-normalize-dash: overpass: normalized N char(s) in step batch (turn T step S)
```

The activation line is written by `apply()`.

The count line and the overpass lines only appear on a normal completion or an N > 0 pass, because N
= 0 is a true no-op with no ledger line, and a thrown-away stream writes no line.

The `hook-dsh-normalize-dash: ` prefix is the `<State.Module>:` identity that `Append` of the
factory composes: the Classic identity, kept byte-identical across the two variants.

## The build and the tests

- Build:
  `pnpm --config.verify-deps-before-run=false --dir EffectTS/packages/ets-hook-dsh-normalize-dash run prepublishOnly`
- Smokes: `node EffectTS/packages/ets-hook-dsh-normalize-dash/Target/Test/<Folder>/Test.js`
    - Config-And-State - 15 checks
    - Journal-And-Custom - 19 checks
    - Overpass - 35 checks
    - Raw-Write-Tool - 52 checks
    - Scopes - 8 checks
    - Stream-Contract - 25 checks
    - Tool-Args-Exemptions - 21 checks
    - Volatile-Live-Flip - 9 checks

## The plan

The plan lives in the own [SCHEME.md](./SCHEME.md) of the package.

The family position and the factory contract are documented in the
[ets-plugin-dsh-factory](../ets-plugin-dsh-factory) and [ets-lib-dsh-core](../ets-lib-dsh-core)
READMEs, and the hook point is the
[llm/stream](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts)
waterfall of the LlmRuntime.

The shared Effect-TS plumbing is the base [ets-base-dsh](../ets-base-dsh) package.
