# @playform/hook-dsh-normalize-dash - The dash normalizer for model output

> Version 0.1.0 - UNPUBLISHED (the npm bootstrap tier 2-planned / 3-candidates). Plan:
> [SCHEME.md](./SCHEME.md), the [factory README](../plugin-dsh-factory/README.md), the
> [core README](../lib-dsh-core/README.md), and the
> [llm/stream](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts)
> reference.

## The role

The **dash normalizer for model output** - a DeepSeek Harness plugin that hooks the
[`llm/stream`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts)
waterfall (the interceptable wrapper around EVERY streaming model call, bound to the LlmRuntime) and
normalizes the unicode dash family to ASCII hyphen-minus, live in the transcript: em dashes, en
dashes and seventeen exotic relatives → `-`. A **CLASS flavor** of the normalize family: the core's
`Dashes` class plus a configurable `replacement` (default `-`). It also registers the family's
**`raw-write` tool** - a write wrapper with an explicit `normalize` parameter (default **false =
verbatim**), exempt from the stream normalization by name like `edit`. The @-sentence identity:
**Hook @ DSH @ Normalize @ Dash**. Unlike the governance family, the rewrite flows into both the
live UI and the durable transcript - the normalization is deliberately **VISIBLE; it IS the
feature**, which is why the injection point was chosen.

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
`logFile`; the module's own fields follow in schema order. `raw-write`'s `normalize` parameter
(absent/false = verbatim, `true`/`"all"` = all six transforms in the family's fixed order, or an
array of flavor names = only the selected flavors) and its `govern` parameter (absent/false = no
governance chain, `true`/`"all"` = all registered steps for the target's basename, or named steps
only) are per-call tool parameters, not config fields.

## The ledger

```text
hook-dsh-normalize-dash: activated (replacement=-, reasoning=on, toolArgs=off, logFile=~/.dsh/playform/hook-dsh-normalize-dash.log)
hook-dsh-normalize-dash: normalized N dash char(s) in one stream
hook-dsh-normalize-dash: overpass: normalized N char(s) in tool result <toolName> <callId>
hook-dsh-normalize-dash: overpass: normalized N char(s) in step batch (turn T step S)
```

The activation line is written by `apply()`; the count line and the overpass lines only appear on a
normal completion / an N > 0 pass (N = 0 is a true no-op - no ledger line; a thrown-away stream
writes no line).

## The build and the tests

- Build:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-normalize-dash run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-normalize-dash/Target/Test/<Folder>/Test.js`
    - Config-And-State - 15 checks
    - Journal-And-Custom - 19 checks
    - Overpass - 35 checks
    - Raw-Write-Tool - 52 checks
    - Scopes - 8 checks
    - Stream-Contract - 25 checks
    - Tool-Args-Exemptions - 21 checks
    - Volatile-Live-Flip - 9 checks

## The plan

The plan lives in the package's own [SCHEME.md](./SCHEME.md); the family position and the factory
contract are documented in the [plugin-dsh-factory](../plugin-dsh-factory) and
[lib-dsh-core](../lib-dsh-core) READMEs, and the hook point is the
[llm/stream](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts)
waterfall of the LlmRuntime.
