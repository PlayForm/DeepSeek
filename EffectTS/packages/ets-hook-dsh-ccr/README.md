# @playform/ets-hook-dsh-ccr - the compress-cache-retrieve hook for oversized tool output

> Version 0.3.0 - UNPUBLISHED (the npm bootstrap tier 2-planned / 3-candidates).
>
> Plan: [SCHEME.md](./SCHEME.md) -
> [APHRODITE-TOOL-COMPRESSION-PLUGIN.md](../../Documentation/Plans/APHRODITE-TOOL-COMPRESSION-PLUGIN.md).

## The role

A DeepSeek Harness plugin that hooks the **`tools/post-execute` waterfall**, the interceptable
wrapper around every normalized dispatch result, before that result becomes model content.

It replaces large tool output with a one-line preview that knows the type, plus a retrieval marker:

```
[terminal:exit 0 | 142 lines | make: *** Error 1]
<<<CCR:9d3c1f0a7b2e4d5c6a8b9c0d|terminal|5231>>>
```

It keeps the original retrievable through the registered **`ccr_retrieve`** tool.

A port of the CCR pipeline of Aphrodite (compress, cache, retrieve) at the injection point that a
proxy cannot reach: the tool result itself.

`tools/post-execute` sees the normalized result of EVERY tool, with name, parsed arguments, and
caller agent.

It is the only point that can legally replace model-visible output for all tools.

This package is the Effect-TS variant: the same ccr contract behind the
[`ets-plugin-dsh-factory`](../ets-plugin-dsh-factory) shell (Effect v4), with ledger strings that
stay byte-identical.

The shared Effect-TS plumbing (the `Activate` composer that builds the durable activation line of
the ledger) comes from the [`ets-base-dsh`](../ets-base-dsh) package.

The gate compresses only results from tools in `targets` (default: `bash`, `glob`, `grep`, `read`,
`web_fetch`, `web_search`, `list`, `search`) whose serialized content exceeds `thresholdBytes`
(1024) times the multiplier of the classified type.

Errors take x8 (high signal, compress late), `grep`, `paths`, and `web` take x2, and the rest take
x1.

Never compress the `exempt` tools: `write`, `edit`, `raw-write`, `subagent`, `ask_user_question`,
and `ccr_retrieve` itself.

Failures pass through unless `compressFailures` is on.

With `autoExpand` on (the default), a result at or under `autoExpandLimitBytes` (102400) is stored
but returned FULL, so no marker reaches the model while the content is cheap enough to keep inline.

The store is an in-memory LRU keyed by a sha256-24 hash of the full serialized content bytes
(`node:crypto`, no native deps).

It has a `storeBudgetBytes` budget (default 256 MiB, least-recently-accessed eviction), a
`ttlSeconds` TTL (default 3600), and an optional JSONL disk journal (`journalPath`, default `""` =
memory-only).

The journal holds one `{hash, type, size, ttlAt, payload}` record per store, loaded and
TTL-compacted on boot, with the payload in base64.

SQLite (Aphrodite's `ccr.db`) was deliberately adapted to JSONL, a native dep that the family does
not carry.

`ccr_retrieve(hash, range?)` matches the hash exactly, with no prefix or fuzzy matching.

A `range { start, count }` slices lines granularly.

Unknown or expired hashes return a self-describing error that tells the model to re-run the original
tool.

Waterfall discipline: `next()` is always awaited first, and pass-through returns the downstream
decision unchanged.

Only an accepted, non-value-carrying decision is replaced.

The whole transform is fail-open: an internal error logs a warning and keeps the inline content, and
it never throws into the waterfall.

The listener prepends so that the gate sees the pristine result.

The ccr hook and the tool-results arm of the normalize flavors share the `tools/post-execute`
waterfall, and the `<<<CCR:` marker guard makes any load order safe.

## The surfaces

| Kind     | Name                                    | What                                                                                    |
| -------- | --------------------------------------- | --------------------------------------------------------------------------------------- |
| listener | `tools/post-execute` (prepend)          | the compression gate: replace oversized results with a preview + `<<<CCR:...>>>` marker |
| listener | `agent/pre-step` (with `contextEngine`) | the engine phase: archives oversized stored results between turns                       |
| tool     | `ccr_retrieve`                          | restores stored output by exact hash, optionally a `{ start, count }` line range        |
| config   | `SCHEME.md`                             | the full Schemastery schema (see the table below)                                       |

## The configuration

| Field                       | Type    | Default                                                                       | Meaning                                                 |
| --------------------------- | ------- | ----------------------------------------------------------------------------- | ------------------------------------------------------- |
| `log`                       | boolean | `true`                                                                        | volatile - the shared factory log switch                |
| `logFile`                   | string  | `~/.dsh/playform/hook-dsh-ccr.log`                                            | volatile - the ledger file                              |
| `targets`                   | array   | `bash`, `glob`, `grep`, `read`, `web_fetch`, `web_search`, `list`, `search`   | the tools whose results the gate compresses             |
| `exempt`                    | array   | `write`, `edit`, `raw-write`, `subagent`, `ask_user_question`, `ccr_retrieve` | never compressed                                        |
| `thresholdBytes`            | number  | `1024`                                                                        | volatile - the base size threshold                      |
| `inlineThresholdBytes`      | number  | `1024`                                                                        | results under this stay inline untouched                |
| `autoExpand`                | boolean | `true`                                                                        | store but return FULL while the content is cheap enough |
| `autoExpandLimitBytes`      | number  | `102400`                                                                      | the auto-expand ceiling                                 |
| `compressFailures`          | boolean | `false`                                                                       | off, error results pass through                         |
| `multipliers`               | object  | terminal 1, error 8, grep 2, paths 2, file 1, json 1, web 2, default 1        | volatile - the per-type threshold multipliers           |
| `previewMaxChars`           | number  | `240`                                                                         | volatile - the preview length cap                       |
| `ttlSeconds`                | number  | `3600`                                                                        | the store TTL                                           |
| `storeBudgetBytes`          | number  | `268435456`                                                                   | the LRU budget (256 MiB)                                |
| `journalPath`               | string  | `""`                                                                          | memory-only unless a JSONL journal path is set          |
| `contextEngine`             | boolean | `false`                                                                       | the engine phase stays inert                            |
| `contextEngineThresholdPct` | number  | `30`                                                                          | the engine's budget-percentage trigger                  |
| `protectFirstTurns`         | number  | `2`                                                                           | turns the engine never archives at the front            |
| `protectLastTurns`          | number  | `4`                                                                           | turns the engine never archives at the back             |

## The ledger

```text
ccr: activated (bundle 0.3.0, targets <n>, budget <n>)
ccr: stored <tool> <type> <size> -> <hash>
ccr: compressed <tool> <type> <size> -> <hash>
ccr: evicted <hash> (<reason>)
ccr: retrieved <hash>
ccr: retrieval miss <hash> (expired)
ccr: retrieval miss <hash> (unknown)
ccr: engine archived <n> results
```

## The build and the tests

- Build:
  `pnpm --config.verify-deps-before-run=false --dir EffectTS/packages/ets-hook-dsh-ccr run prepublishOnly`
- Smokes: `node EffectTS/packages/ets-hook-dsh-ccr/Target/Test/<Folder>/Test.js`
    - Config-And-Activation - 25 checks
    - Engine-Flag-Off - 14 checks
    - Engine-Flag-On - 37 checks
    - Journal-Compaction - 10 checks
    - Retrieve-And-Marker - 45 checks
    - Run-One-State - 15 checks
    - Volatile-Refresh - 1 check

## The plan

[SCHEME.md](./SCHEME.md) -
[APHRODITE-TOOL-COMPRESSION-PLUGIN.md](../../Documentation/Plans/APHRODITE-TOOL-COMPRESSION-PLUGIN.md).
