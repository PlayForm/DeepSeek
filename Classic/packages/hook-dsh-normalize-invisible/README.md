# @playform/hook-dsh-normalize-invisible - The invisible-character normalizer for model output

> Version 0.1.0 - UNPUBLISHED (the npm bootstrap tier 2-planned / 3-candidates).
>
> Plan: the [factory README](../plugin-dsh-factory/README.md), the
> [core README](../lib-dsh-core/README.md), and the
> [llm/stream](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts)
> reference.

## The role

This package is the **invisible-character normalizer for model output** - a DeepSeek Harness plugin
that hooks the
[`llm/stream`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts)
waterfall (the interceptable wrapper around EVERY streaming model call, bound to the LlmRuntime) and
normalizes the zero-width/invisible character family in model output, live in the transcript - by
REMOVING it: zero-width spaces, joiners, bidi controls and the BOM character simply vanish.

It is a **CLASS flavor** of the normalize family: the core's `Invisible` class plus a configurable
`replacement` string (default `""` - removal).

The @-sentence identity: **Hook @ DSH @ Normalize @ Invisible**.

The family's `raw-write` tool (registered by [hook-dsh-normalize-dash](../hook-dsh-normalize-dash))
bypasses this flavor's transforms too - the exemption is family-wide, so the tool's explicit
`normalize` parameter (default false = verbatim) is the only normalization it applies.

Unlike the governance family, the rewrite flows into both the live UI and the durable transcript -
the normalization is deliberately **VISIBLE; it IS the feature**.

## The surfaces

| Kind           | Name               | What                                                                                                                                                  |
| -------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| listener       | llm/stream         | normalizes the zero-width/invisible character family live in the transcript (text/reasoning deltas, assembled block-end blocks, tool arguments gated) |
| listener       | tools/post-execute | overpass arm, opt-in via scopes.toolResults (prepended, outermost vs the ccr gate)                                                                    |
| listener       | agent/pre-step     | overpass arm, opt-in via scopes.batch                                                                                                                 |
| config/command | normalize-overpass | arms the one-shot batch overpass, flips scopes.toolResults, reports the scopes - the files sweep is declined                                          |

## The configuration

| Field                    | Type     | Default                                                                                        | Meaning                                                                                                                                        |
| ------------------------ | -------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `log`                    | boolean  | `true`                                                                                         | write the durable ledger file (volatile)                                                                                                       |
| `logFile`                | string   | `~/.dsh/playform/hook-dsh-normalize-invisible.log`                                             | the normalize-invisible ledger (volatile)                                                                                                      |
| `replacement`            | string   | `""`                                                                                           | the transform's only knob - the empty string (removal); hot-editable, the next stream picks it up with no remount (volatile)                   |
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
`logFile`; the module's own fields follow in schema order.

## The ledger

```text
hook-dsh-normalize-invisible: activated (replacement=, reasoning=on, toolArgs=off, logFile=~/.dsh/playform/hook-dsh-normalize-invisible.log)
hook-dsh-normalize-invisible: normalized N invisible char(s) in one stream
hook-dsh-normalize-invisible: overpass: normalized N char(s) in tool result <toolName> <callId>
hook-dsh-normalize-invisible: overpass: normalized N char(s) in step batch (turn T step S)
```

`apply()` writes the activation line; the count line and the overpass lines only appear on a normal
completion / an N > 0 pass (N = 0 is a true no-op - no ledger line; a thrown-away stream writes no
line).

## The build and the tests

- Build:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-normalize-invisible run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-normalize-invisible/Target/Test/<Folder>/Test.js`
    - Config-And-State - 14 checks
    - Overpass - 34 checks
    - Runs - 23 checks
    - Scopes - 8 checks
    - Stream-Contract - 25 checks

## The plan

The family position and the factory contract are documented in the
[plugin-dsh-factory](../plugin-dsh-factory) and [lib-dsh-core](../lib-dsh-core) READMEs, and the
hook point is the
[llm/stream](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts)
waterfall of the LlmRuntime; the bundle is configured through its
[cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-invisible/cordis.patch.yml)
row.
