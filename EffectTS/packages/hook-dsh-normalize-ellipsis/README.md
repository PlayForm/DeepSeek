# @playform/hook-dsh-normalize-ellipsis

_The DeepSeek Harness Plugin Family for PlayForm._

[![npm](https://img.shields.io/static/v1?label=npm&message=%40playform%2Fhook-dsh-normalize-ellipsis&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-normalize-ellipsis)
[![release](https://img.shields.io/static/v1?label=release&message=v0.0.1&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-normalize-ellipsis)
[![variant](https://img.shields.io/static/v1?label=variant&message=EFFECT-TS&color=blue)](../../README.md)
[![sibling](https://img.shields.io/static/v1?label=sibling&message=CLASSIC&color=white)](../../README.md)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

> [!NOTE]
>
> The **ellipsis normalizer for model output** - a DeepSeek Harness plugin that hooks the
> [`llm/stream`][dsh-llm] waterfall (the interceptable wrapper around EVERY streaming model call, bound to the
> [LlmRuntime][dsh-llm]) and normalizes the horizontal ellipsis in model output, live in the transcript: every
> typographic three-dot ellipsis code point becomes the ASCII three-dot sequence - U+2026 to `...`.
>
> _A CLASS flavor of the normalize family: the core's `Ellipsis` class plus a configurable
> `replacement` string (default `...`). The @-sentence identity: **Hook @ DSH @ Normalize @
> Ellipsis**._
>
> _The family's `raw-write` tool (registered by
> [`hook-dsh-normalize-dash`](../hook-dsh-normalize-dash)) bypasses this flavor's transforms too -
> the exemption is family-wide: the core's `Stream/Chunk` + `Stream/Block` pass every `raw-write`
> call through by identity, so the tool's explicit `normalize` parameter (default false = verbatim)
> is the only normalization it applies._

---

## Where It Fits

**Family position** (the @-sentence **Hook @ DSH @ Normalize @ Ellipsis**): a hook child of the
[`plugin-dsh-factory`](../plugin-dsh-factory) service and the [`hook-dsh-core`](../hook-dsh-core)
machinery; the second of the six stream normalizer siblings.

One of **six siblings** in the stream-normalization family, all built on the shared machinery -
[`plugin-dsh-factory`](../plugin-dsh-factory) for `State`/`Append` (and the named `Schema` helper,
`shared: false`, for the config), [`hook-dsh-core`](../hook-dsh-core) for the `Ellipsis` class and
the generic `Replace`/`Chunk`/`Block` dispatch:

| flavor                                                            | table                  | substitution                  |
| ----------------------------------------------------------------- | ---------------------- | ----------------------------- |
| [`hook-dsh-normalize-dash`](../hook-dsh-normalize-dash)           | core `Dashes` class    | `→ replacement` (default `-`) |
| [`hook-dsh-normalize-quotes`](../hook-dsh-normalize-quotes)       | core `Quotes` MAP      | curly → straight              |
| [hook-dsh-normalize-ellipsis](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/hook-dsh-normalize-ellipsis/Source) (this bundle)                       | core `Ellipsis` class  | U+2026 → `...`                |
| [`hook-dsh-normalize-spaces`](../hook-dsh-normalize-spaces)       | core `Spaces` class    | unicode spaces → `" "`        |
| [`hook-dsh-normalize-invisible`](../hook-dsh-normalize-invisible) | core `Invisible` class | removed (default `""`)        |
| [`hook-dsh-normalize-fullwidth`](../hook-dsh-normalize-fullwidth) | core `Fullwidth` MAP   | full-width → half-width       |

A **non-manifest factory consumer**: it injects `["pluginFactory"]` and uses only `State` (cell
unwrap + shared `Ledger`/`Enabled` mappings + its own fields) and `Append`; the config is composed
by the factory's standalone `Schema` helper with `shared: false` - the minimal block, no
[fs/observed][dsh-fs]
dead fields.

It touches no files, so
[fs/write-intent][dsh-fs] and
[fs/observed][dsh-fs] never see it; it wraps the
downstream result and always calls `next()`, so it composes with other
[`llm/stream`][dsh-llm] listeners
regardless of registration order.

The DSH plugin family is the DeepSeek Harness plugin layer of the PlayForm ecosystem:
TypeScript-first `Source/` → `Target/`, the deterministic `@playform` build, `prepublishOnly`-only -
the same conventions as every other @playform package.

## Install

**`Terminal`** (registry)

```sh
pnpm add @playform/hook-dsh-normalize-ellipsis
```

1. **Remote / dependency install (auto-activation):**
   `pnpm add @playform/hook-dsh-normalize-ellipsis` in a profile dir (+ the package name in
   `dsh.profile.bundles`, or `dsh plugin add`) - installed automatically and activated at the next
   host start.
2. **Local git clone:** clone → `pnpm install` inside the bundle (its `pnpm-workspace.yaml` pins
   `packages: [.]` so the install lands in the bundle, not the workspace root) → build →
   `dsh plugin --profile <name> add <this directory>`.
3. **Tarball / npm**: `dsh plugin --profile <name> add <tarball-or-spec>` - the package ships built
   `Target/` (minified, `.d.ts` twins), so no build runs at install time.

Verify with the `hook-dsh-normalize-ellipsis: activated (...)` ledger line.

### Usage

The bundle is configured through its [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/hook-dsh-normalize-ellipsis/cordis.patch.yml) row (or the profile's `dsh.bundle`
manifest) - the full config table is in [The Config](#the-config):

```yaml
- insert:
      - id: hook-dsh-normalize-ellipsis
        name: "@playform/hook-dsh-normalize-ellipsis"
        config:
            log: true
            logFile: ~/.dsh/hook-dsh-normalize-ellipsis.log
            replacement: "..."
```

---

## The Problem

Text processors collapse the typographic three-dot run into a single code point - U+2026, the
horizontal ellipsis.

In code blocks, commands and diffs the collapsed form is simply wrong: three
literal dots are what every parser, shell and search expects.

This flavor makes the ASCII spelling
the one that reaches the transcript.

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
       ├─ text-delta ─────────► Replace(text, Ellipsis, "...")  rewrite the text field
       ├─ reasoning-delta ────► same, when normalizeReasoning (default ON)
       ├─ block-end ──────────► the assembled block's text fields -
       │                        TextBlock.text / ReasoningBlock.text (plus a
       │                        runtime `thinking` string field) - the deltas
       │                        AND the block must agree, or consumers see
       │                        inconsistencies
       ├─ tool-call-delta ────► Replace(argumentsDelta, Ellipsis, "...") when
       │                        normalizeToolArguments (IMPLEMENTED, default
       │                        OFF - execution-critical raw JSON, the user's
       │                        accepted risk; this profile's patch turns it
       │                        on) - the assembled ToolCallBlock.arguments
       │                        follows the same flag via block-end
       │                        The gate is THREE-WAY with the flag on: a
       │                        delta/block whose `name` is "edit" passes
       │                        through BY IDENTITY (the edit tool's
       │                        `old_string` must match the real file bytes),
       │                        and a call whose arguments open with the
       │                        `{"__normalize":false` marker (FIRST key,
       │                        tracked per call id) passes through
       │                        UNNORMALIZED with the marker entry stripped,
       │                        so the executed call carries no unknown key
       └─ block-start / usage / finish
                                 ──► PASSTHROUGH BY IDENTITY, ALWAYS
                                     (usage/finish ordering is the
                                      adapter contract)
       │   count === 0 → original chunk BY IDENTITY; rewritten → shallow copy
       ▼
  yield ──► downstream consumers = the live UI + the durable transcript
       │    (order preserved, no buffering; upstream throws propagate)
       ▼  normal loop completion, Count > 0
  Factory.Append ──► `hook-dsh-normalize-ellipsis: normalized N ellipsis char(s) in one stream`
```

### The transform

Exactly the core's `Ellipsis` class ([@playform/hook-dsh-core](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/hook-dsh-core/Source)'s `Normalize/Ellipsis`), applied per
text segment through the core's generic class-to-string `Replace`:

```text
[\u2026]  →  replacement
```

U+2026 (horizontal ellipsis - the typographic three-dot run collapsed into one code point by text
processors) becomes the config `replacement` (default `...`, the ASCII three-dot sequence - the
ellipsis's own ASCII spelling).

- **No context rules** - hermes-style whole-chunk replacement, no lookahead; chunk-boundary-safe.
- The replacement is applied with a **function replacer**, so a custom `replacement` containing `$`
  patterns is inserted literally.
- Replaced characters are **counted per stream** for the ledger line - each replaced ellipsis code
  point counts once, even though the default replacement emits three characters.

---

## The Config

| Field                    | Type    | Default                                  | Volatile | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------ | ------- | ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `log`                    | boolean | `true`                                   | yes      | write the durable ledger file                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `logFile`                | string  | `~/.dsh/hook-dsh-normalize-ellipsis.log` | yes      | the ellipsis ledger (separate from the family's logs)                                                                                                                                                                                                                                                                                                                                                                                                               |
| `replacement`            | string  | `...`                                    | yes      | the transform's only knob - hot-editable, the next stream picks it up with no remount                                                                                                                                                                                                                                                                                                                                                                               |
| `normalizeReasoning`     | boolean | `true`                                   | no       | normalize reasoning deltas and the assembled reasoning block too                                                                                                                                                                                                                                                                                                                                                                                                    |
| `normalizeToolArguments` | boolean | `false`                                  | no       | IMPLEMENTED (default OFF): rewrite the tool-call argumentsDelta and the assembled ToolCallBlock.arguments when on (with two exemptions: an `edit` call passes through by identity, its `old_string` must match the real file bytes; and a call whose arguments open with the `{"__normalize":false` first-key marker passes through unnormalized, the marker entry stripped) - execution-critical raw JSON, the user's accepted risk; the example patch turns it on |

Volatile cells commit without remounting the plugin; the factory's State builder unwraps them
defensively.

---

## In Action

One stream, one transformation.

The model emits the collapsed typographic ellipsis; the live UI and
the transcript receive three ASCII dots:

```text
text-delta in (what the model wrote):

  "loading the modules, one by one, until the whole set is ready and then …"

text-delta out (what reaches the transcript):

  "loading the modules, one by one, until the whole set is ready and then ..."
```

The single U+2026 code point becomes the three-dot ASCII sequence `...`; dots that were already
ASCII are untouched.

Each replaced code point counts once in the ledger even though it expands to
three characters - which is why one ellipsis can show up as `normalized 3 ellipsis char(s)` for
three collapsed code points, not nine output characters:

```text
hook-dsh-normalize-ellipsis: normalized 3 ellipsis char(s) in one stream
```

The `replacement` is hot-editable: change it in the config (say to `. . .`) and the very next stream
picks it up with no remount.

The same pass runs over reasoning deltas when `normalizeReasoning` is
on, and over tool-call arguments when the example patch enables `normalizeToolArguments` - with the
`edit` name exempt and raw-marker calls passing through unnormalized.

---

## The Ledger

Two lines, both written through the factory's `Append` (the hook-dsh-normalize-ellipsis: prefix is
the logger's `<State.Module>:`; the durable file line is `[<ISO>] <message>`):

```text
hook-dsh-normalize-ellipsis: activated (replacement=..., reasoning=on, toolArgs=off, logFile=~/.dsh/hook-dsh-normalize-ellipsis.log)
hook-dsh-normalize-ellipsis: normalized N ellipsis char(s) in one stream
```

The activation line is written by `apply()`; the count line only follows a normal stream completion
and only when N > 0 (a thrown-away stream writes no ledger line).

---

## License 📜

CC0-1.0.

[dsh-llm]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts
[dsh-fs]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts
