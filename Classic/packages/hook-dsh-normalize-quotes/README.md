# @playform/hook-dsh-normalize-quotes

_The DeepSeek Harness Plugin Family for PlayForm._

[![npm](https://img.shields.io/static/v1?label=npm&message=%40playform%2Fhook-dsh-normalize-quotes&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-normalize-quotes)
[![release](https://img.shields.io/static/v1?label=release&message=v0.0.1&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-normalize-quotes)
[![variant](https://img.shields.io/static/v1?label=variant&message=CLASSIC&color=blue)](../../README.md)
[![sibling](https://img.shields.io/static/v1?label=sibling&message=EFFECT-TS&color=white)](../../README.md)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

> [!NOTE]
>
> The **quote normalizer for model output** - a DeepSeek Harness plugin that hooks the [`llm/stream`][dsh-llm]
> waterfall (the interceptable wrapper around EVERY streaming model call, bound to the [LlmRuntime][dsh-llm])
> and normalizes the curly quote family in model output, live in the transcript: the eight
> typographic quote code points each map to their ASCII straight counterpart -
> U+2018/U+2019/U+201A/U+201B to the ASCII apostrophe, and U+201C/U+201D/U+201E/U+201F to the ASCII
> double quote.
>
> _A MAP flavor of the normalize family: the core's `Quotes` char-to-char table owns the
> substitution - no `replacement` config knob._
>
> _The @-sentence identity: **Hook @ DSH @ Normalize @
> Quotes**._
>
> _The family's `raw-write` tool (registered by
> [`hook-dsh-normalize-dash`](../hook-dsh-normalize-dash)) bypasses this flavor's transforms too -
> the exemption is family-wide: the core's `Stream/Chunk` + `Stream/Block` pass every `raw-write`
> call through by identity, so the tool's explicit `normalize` parameter (default false = verbatim)
> is the only normalization it applies._

---

## Where It Fits

**Family position** (the @-sentence **Hook @ DSH @ Normalize @ Quotes**): a hook child of the
[`plugin-dsh-factory`](../plugin-dsh-factory) service and the [`hook-dsh-core`](../hook-dsh-core)
machinery; the second of the six stream normalizer siblings.

One of **six siblings** in the stream-normalization family, all built on the shared machinery -
[`plugin-dsh-factory`](../plugin-dsh-factory) for `State`/`Append` (and the named `Schema` helper,
`shared: false`, for the config), [`hook-dsh-core`](../hook-dsh-core) for the `Quotes` table and the
generic `ReplaceMap`/`Chunk`/`Block` dispatch:

| flavor                                                            | table                  | substitution                  |
| ----------------------------------------------------------------- | ---------------------- | ----------------------------- |
| [`hook-dsh-normalize-dash`](../hook-dsh-normalize-dash)           | core `Dashes` class    | `→ replacement` (default `-`) |
| [hook-dsh-normalize-quotes](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-quotes/Source) (this bundle)                         | core `Quotes` MAP      | curly → straight              |
| [`hook-dsh-normalize-ellipsis`](../hook-dsh-normalize-ellipsis)   | core `Ellipsis` class  | U+2026 → `...`                |
| [`hook-dsh-normalize-spaces`](../hook-dsh-normalize-spaces)       | core `Spaces` class    | unicode spaces → `" "`        |
| [`hook-dsh-normalize-invisible`](../hook-dsh-normalize-invisible) | core `Invisible` class | removed (default `""`)        |
| [`hook-dsh-normalize-fullwidth`](../hook-dsh-normalize-fullwidth) | core `Fullwidth` MAP   | full-width → half-width       |

A **non-manifest factory consumer**: it injects `["pluginFactory"]` and uses only `State` (cell
unwrap + shared `Ledger`/`Enabled` mappings + its own fields) and `Append`; the config is composed
by the factory's standalone `Schema` helper with `shared: false` - the minimal block, no [fs/observed][dsh-fs]
dead fields.

It touches no files, so [fs/write-intent][dsh-fs] and [fs/observed][dsh-fs] never see it; it wraps the
downstream result and always calls `next()`, so it composes with other [`llm/stream`][dsh-llm] listeners
regardless of registration order.

The DSH plugin family is the DeepSeek Harness plugin layer of the PlayForm ecosystem:
TypeScript-first `Source/` → `Target/`, the deterministic `@playform` build, `prepublishOnly`-only -
the same conventions as every other @playform package.

## Install

**`Terminal`** (registry)

```sh
pnpm add @playform/hook-dsh-normalize-quotes
```

1. **Remote / dependency install (auto-activation):** `pnpm add @playform/hook-dsh-normalize-quotes`
   in a profile dir (+ the package name in `dsh.profile.bundles`, or `dsh plugin add`) - installed
   automatically and activated at the next host start.
2. **Local git clone:** clone → `pnpm install` inside the bundle (its `pnpm-workspace.yaml` pins
   `packages: [.]` so the install lands in the bundle, not the workspace root) → build →
   `dsh plugin --profile <name> add <this directory>`.
3. **Tarball / npm**: `dsh plugin --profile <name> add <tarball-or-spec>` - the package ships built
   `Target/` (minified, `.d.ts` twins), so no build runs at install time.

Verify with the `hook-dsh-normalize-quotes: activated (...)` ledger line.

### Usage

The bundle is configured through its [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-quotes/cordis.patch.yml) row (or the profile's `dsh.bundle`
manifest) - the full config table is in [The Config](#the-config):

```yaml
- insert:
      - id: hook-dsh-normalize-quotes
        name: "@playform/hook-dsh-normalize-quotes"
        config:
            log: true
            logFile: ~/.dsh/hook-dsh-normalize-quotes.log
            normalizeReasoning: true
```

---

## The Problem

Smart-quote processors and code editors emit typographic quotes; every parser, shell and diff
understands the straight ASCII ones.

Left in model output, a curly quote is a silent correctness
hazard - in code blocks, commands and file paths it is simply the wrong character.

This flavor makes
the straight form the one that reaches the transcript.

---

## How It Works

**`The stream pipeline`**

```text
  llm/stream waterfall (options, next)     the interceptable wrapper around
       │                                   EVERY streaming model call
       ▼  next() called FIRST, always - options never touched
  Normalize(upstream, state)               the async generator
       │   for await (chunk of upstream)
       ▼
  CoreChunk(chunk, transform, reasoning, toolArgs, raw)  the core's per-chunk dispatch
       │
       ├─ text-delta ────────► ReplaceMap(text, Quotes)     rewrite the text field
       ├─ reasoning-delta ───► same, when normalizeReasoning (default ON)
       ├─ block-end ─────────► the assembled block's text fields -
       │                       TextBlock.text / ReasoningBlock.text (plus a
       │                       runtime `thinking` string field) - the deltas
       │                       AND the block must agree, or consumers see
       │                       inconsistencies
       ├─ tool-call-delta ───► ReplaceMap(argumentsDelta, Quotes) when
       │                       normalizeToolArguments (IMPLEMENTED, default
       │                       OFF - execution-critical raw JSON, the user's
       │                       accepted risk; the example patch turns it
       │                       on) - the assembled ToolCallBlock.arguments
       │                       follows the same flag via block-end
       │                       The gate is THREE-WAY with the flag on: a
       │                       delta/block whose `name` is "edit" passes
       │                       through BY IDENTITY (the edit tool's
       │                       `old_string` must match the real file bytes),
       │                       and a call whose arguments open with the
       │                       `{"__normalize":false` marker (FIRST key,
       │                       tracked per call id) passes through
       │                       UNNORMALIZED with the marker entry stripped,
       │                       so the executed call carries no unknown key
       └─ block-start / usage / finish
                                ──► PASSTHROUGH BY IDENTITY, ALWAYS
                                    (usage/finish ordering is the
                                     adapter contract)
       │   count === 0 → original chunk BY IDENTITY; rewritten → shallow copy
       ▼
  yield ──► downstream consumers = the live UI + the durable transcript
       │    (order preserved, no buffering; upstream throws propagate)
       ▼  normal loop completion, Count > 0
  Factory.Append ──► `hook-dsh-normalize-quotes: normalized N quote char(s) in one stream`
```

### The transform

Exactly the core's `Quotes` map ([@playform/hook-dsh-core](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-core/Source)'s `Normalize/Quotes`), applied per text
segment through the core's `ReplaceMap` - eight entries, each typographic quote code point to its
ASCII straight counterpart:

| Code point | Character (by name)                   | ASCII        |
| ---------- | ------------------------------------- | ------------ |
| U+2018     | left single quotation mark            | `'` (U+0027) |
| U+2019     | right single quotation mark           | `'`          |
| U+201A     | single low-9 quotation mark           | `'`          |
| U+201B     | single high-reversed-9 quotation mark | `'`          |
| U+201C     | left double quotation mark            | `"` (U+0022) |
| U+201D     | right double quotation mark           | `"`          |
| U+201E     | double low-9 quotation mark           | `"`          |
| U+201F     | double high-reversed-9 quotation mark | `"`          |

- **No context rules** - one character in, its straight counterpart out.
- **Chunk-boundary-safe**: single-character substitution, no lookahead - per-chunk application can
  never disagree with whole-text application.
- The mapping values are returned through a **function replacer**, so they are inserted literally
  (no `$`-pattern interpretation).
- Replaced characters are **counted per stream** for the ledger line.

---

## The Config

| Field                    | Type    | Default                                | Volatile | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------ | ------- | -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `log`                    | boolean | `true`                                 | yes      | write the durable ledger file                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `logFile`                | string  | `~/.dsh/hook-dsh-normalize-quotes.log` | yes      | the quotes ledger (separate from the family's logs)                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `normalizeReasoning`     | boolean | `true`                                 | no       | normalize reasoning deltas and the assembled reasoning block too                                                                                                                                                                                                                                                                                                                                                                                                    |
| `normalizeToolArguments` | boolean | `false`                                | no       | IMPLEMENTED (default OFF): rewrite the tool-call argumentsDelta and the assembled ToolCallBlock.arguments when on (with two exemptions: an `edit` call passes through by identity, its `old_string` must match the real file bytes; and a call whose arguments open with the `{"__normalize":false` first-key marker passes through unnormalized, the marker entry stripped) - execution-critical raw JSON, the user's accepted risk; the example patch turns it on |

There is **no `replacement` field** (MAP flavor).

Volatile cells commit without remounting the
plugin; the factory's State builder unwraps them defensively.

---

## In Action

One stream, one transformation.

The model emits smart-quoted prose; the live UI and the transcript
receive the straight ASCII forms:

```text
text-delta in (what the model wrote):

  ‘She said “let’s ship it” — today’s the day’

text-delta out (what reaches the transcript):

  'She said "let's ship it" - today's the day'
```

Every typographic quote in the incoming text - the four single forms and the four double forms -
becomes its ASCII counterpart; straight quotes that were already there are untouched (the count only
counts replacements).

In code blocks, commands and file paths this is the difference between a
command that runs and one that fails for no visible reason.

When a stream finishes normally with
replacements made, the ledger gets the count line:

```text
hook-dsh-normalize-quotes: normalized 8 quote char(s) in one stream
```

(The same pass runs over reasoning deltas when `normalizeReasoning` is on, and over tool-call
arguments when the example patch enables `normalizeToolArguments` - with the `edit` name exempt and
the raw-marker calls passing through unnormalized.)

---

## The Ledger

Two lines, both written through the factory's `Append` (the hook-dsh-normalize-quotes: prefix is
the logger's `<State.Module>:`; the durable file line is `[<ISO>] <message>`):

```text
hook-dsh-normalize-quotes: activated (reasoning=on, toolArgs=off, logFile=~/.dsh/hook-dsh-normalize-quotes.log)
hook-dsh-normalize-quotes: normalized N quote char(s) in one stream
```

The activation line is written by `apply()`; the count line only follows a normal stream completion
and only when N > 0 (a thrown-away stream writes no ledger line).

---

## License 📜

CC0-1.0.

[dsh-llm]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts
[dsh-fs]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts
