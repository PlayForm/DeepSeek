# @playform/hook-dsh-normalize-invisible

_The DeepSeek Harness Plugin Family for PlayForm._

[![npm](https://img.shields.io/static/v1?label=npm&message=%40playform%2Fhook-dsh-normalize-invisible&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-normalize-invisible)
[![release](https://img.shields.io/static/v1?label=release&message=v0.0.1&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-normalize-invisible)
[![variant](https://img.shields.io/static/v1?label=variant&message=EFFECT-TS&color=blue)](../../README.md)
[![sibling](https://img.shields.io/static/v1?label=sibling&message=CLASSIC&color=white)](../../README.md)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

> [!NOTE]
>
> The **invisible-character normalizer for model output** - a DeepSeek Harness plugin that hooks the
> [`llm/stream`][dsh-llm] waterfall (the interceptable wrapper around EVERY streaming model call, bound to the
> [LlmRuntime][dsh-llm]) and normalizes the zero-width/invisible character family in model output, live in the
> transcript - by REMOVING it: zero-width spaces, joiners, bidi controls and the BOM character
> simply vanish (the default replacement is the empty string).
>
> _A CLASS flavor of the normalize family: the core's `Invisible` class plus a configurable
> `replacement` string (default `""` - removal). The @-sentence identity: **Hook @ DSH @ Normalize @
> Invisible**._
>
> _The family's `raw-write` tool (registered by
> [`hook-dsh-normalize-dash`](../hook-dsh-normalize-dash)) bypasses this flavor's transforms too -
> the exemption is family-wide: the core's `Stream/Chunk` + `Stream/Block` pass every `raw-write`
> call through by identity, so the tool's explicit `normalize` parameter (default false = verbatim)
> is the only normalization it applies._

---

## Where It Fits

**Family position** (the @-sentence **Hook @ DSH @ Normalize @ Invisible**): a hook child of the
[`plugin-dsh-factory`](../plugin-dsh-factory) service and the [`hook-dsh-core`](../hook-dsh-core)
machinery; the fifth of the six stream normalizer siblings.

One of **six siblings** in the stream-normalization family, all built on the shared machinery -
[`plugin-dsh-factory`](../plugin-dsh-factory) for `State`/`Append` (and the named `Schema` helper,
`shared: false`, for the config), [`hook-dsh-core`](../hook-dsh-core) for the `Invisible` class and
the generic `Replace`/`Chunk`/`Block` dispatch:

| flavor                                                            | table                  | substitution                  |
| ----------------------------------------------------------------- | ---------------------- | ----------------------------- |
| [`hook-dsh-normalize-dash`](../hook-dsh-normalize-dash)           | core `Dashes` class    | `→ replacement` (default `-`) |
| [`hook-dsh-normalize-quotes`](../hook-dsh-normalize-quotes)       | core `Quotes` MAP      | curly → straight              |
| [`hook-dsh-normalize-ellipsis`](../hook-dsh-normalize-ellipsis)   | core `Ellipsis` class  | U+2026 → `...`                |
| [`hook-dsh-normalize-spaces`](../hook-dsh-normalize-spaces)       | core `Spaces` class    | unicode spaces → `" "`        |
| [hook-dsh-normalize-invisible](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/hook-dsh-normalize-invisible/Source) (this bundle)                      | core `Invisible` class | removed (default `""`)        |
| [`hook-dsh-normalize-fullwidth`](../hook-dsh-normalize-fullwidth) | core `Fullwidth` MAP   | full-width → half-width       |

A **non-manifest factory consumer**: it injects `["pluginFactory"]` and uses only `State` (cell
unwrap + shared `Ledger`/`Enabled` mappings + its own fields) and `Append`; the config is composed
by the factory's standalone `Schema` helper with `shared: false` - the minimal block, no
[fs/observed][dsh-fs]
dead fields. It touches no files, so
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
pnpm add @playform/hook-dsh-normalize-invisible
```

1. **Remote / dependency install (auto-activation):**
   `pnpm add @playform/hook-dsh-normalize-invisible` in a profile dir (+ the package name in
   `dsh.profile.bundles`, or `dsh plugin add`) - installed automatically and activated at the next
   host start.
2. **Local git clone:** clone → `pnpm install` inside the bundle (this bundle's own
   `pnpm-workspace.yaml` - `packages: [.]`, `nodeLinker: hoisted` - keeps the install local) →
   `npm run prepublishOnly` to build `Target/` → `dsh plugin --profile <name> add <this directory>`
   and a restart.

Activation is at boot; verify with `dsh --profile <name> --dump-config` and the
`hook-dsh-normalize-invisible: activated (...)` ledger line.

### Usage

The bundle is configured through its [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/hook-dsh-normalize-invisible/cordis.patch.yml) row (or the profile's `dsh.bundle`
manifest) - the full config table is in [The Config](#the-config):

```yaml
- insert:
      - id: hook-dsh-normalize-invisible
        name: "@playform/hook-dsh-normalize-invisible"
        config:
            log: true
            logFile: ~/.dsh/hook-dsh-normalize-invisible.log
            replacement: ""
```

---

## The Problem

Zero-width and format characters carry no visible width - which makes them the perfect smugglers. A
zero-width joiner inside a file path, a right-to-left mark inside a command, the U+202E
visual-spoofing override in what looks like plain text: none of them show up in the transcript, all
of them change what a parser, shell or diff sees. This flavor deletes the whole family before it
reaches the transcript.

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
       ├─ text-delta ────────► Replace(text, Invisible, "")  rewrite the text field
       ├─ reasoning-delta ───► same, when normalizeReasoning (default ON)
       ├─ block-end ─────────► the assembled block's text fields -
       │                       TextBlock.text / ReasoningBlock.text (plus a
       │                       runtime `thinking` string field) - the deltas
       │                       AND the block must agree, or consumers see
       │                       inconsistencies
       ├─ tool-call-delta ───► Replace(argumentsDelta, Invisible, "") when
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
  Factory.Append ──► `hook-dsh-normalize-invisible: normalized N invisible char(s) in one stream`
```

### The transform

The core's `Invisible` class (see [`hook-dsh-core`](../hook-dsh-core)), applied per text segment
through the core's generic class-to-string `Replace`:

```text
[\u00AD\u200B\u200C\u200D\u200E\u200F\u202A-\u202E\u2060\uFEFF]  →  replacement
```

| U+ codepoints | Characters                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------- |
| 00AD          | soft hyphen                                                                                       |
| 200B          | zero-width space                                                                                  |
| 200C          | zero-width non-joiner                                                                             |
| 200D          | zero-width joiner                                                                                 |
| 200E          | left-to-right mark                                                                                |
| 200F          | right-to-left mark                                                                                |
| 202A-202E     | LRE, RLE, PDF, LRO, RLO (bidi embedding controls; U+202E is the classic visual-spoofing override) |
| 2060          | word joiner                                                                                       |
| FEFF          | zero-width no-break space (the BOM character)                                                     |

All are removed (default `replacement: ""` - REMOVAL) per text segment:

- **No context rules, chunk-boundary-safe** - single-character replacement, no lookahead, per-chunk
  application can never disagree with whole-text application.
- The replacement is applied with a **function replacer**, so a custom `replacement` containing `$`
  patterns is inserted literally.
- Replaced characters are **counted per stream** for the ledger line.

---

## The Config

| Field                    | Type    | Default                                   | Volatile | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------ | ------- | ----------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `log`                    | boolean | `true`                                    | yes      | write the durable ledger file                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `logFile`                | string  | `~/.dsh/hook-dsh-normalize-invisible.log` | yes      | the invisible ledger (separate from the family's logs)                                                                                                                                                                                                                                                                                                                                                                                                              |
| `replacement`            | string  | `""`                                      | yes      | the transform's only knob - default REMOVAL; hot-editable                                                                                                                                                                                                                                                                                                                                                                                                           |
| `normalizeReasoning`     | boolean | `true`                                    | no       | normalize reasoning deltas and the assembled reasoning block too                                                                                                                                                                                                                                                                                                                                                                                                    |
| `normalizeToolArguments` | boolean | `false`                                   | no       | IMPLEMENTED (default OFF): rewrite the tool-call argumentsDelta and the assembled ToolCallBlock.arguments when on (with two exemptions: an `edit` call passes through by identity, its `old_string` must match the real file bytes; and a call whose arguments open with the `{"__normalize":false` first-key marker passes through unnormalized, the marker entry stripped) - execution-critical raw JSON, the user's accepted risk; the example patch turns it on |

Volatile cells commit without remounting the plugin; the factory's State builder unwraps them
defensively.

---

## In Action

One stream, one deletion. The model emits text carrying invisible smugglers; the live UI and the
transcript receive clean text - and the two lines below look identical in print, because the removed
characters are invisible. The incoming line carries, in order: a soft hyphen (U+00AD), a zero-width
space (U+200B), a zero-width joiner (U+200D), a left-to-right mark (U+200E), a right-to-left mark
(U+200F), a word joiner (U+2060) and a BOM character (U+FEFF):

```text
text-delta in (what the model wrote):

  pass­s​word‍:‎ correct‏⁠﻿

text-delta out (what reaches the transcript):

  "password: correct"
```

In the incoming line the smugglers sit inside the word `password` and around the colon; a diff would
see a `password` that does not match the author's text, a parser would tokenize differently, a shell
could splice a command. After the pass all of them are simply gone - the output line is what the
reader should see. When a stream finishes normally with replacements made, the ledger gets the count
line:

```text
hook-dsh-normalize-invisible: normalized 7 invisible char(s) in one stream
```

The `replacement` is hot-editable (the default `""` removes; a non-empty value such as `"?"` would
mark each smuggler's position for debugging), and the same pass runs over reasoning deltas when
`normalizeReasoning` is on and over tool-call arguments when the example patch enables
`normalizeToolArguments` - with the `edit` name exempt and raw-marker calls passing through
unnormalized.

---

## The Ledger

Two lines, both written through the factory's `Append` (the hook-dsh-normalize-invisible: prefix
is the logger's `<State.Module>:`; the durable file line is `[<ISO>] <message>`):

```text
hook-dsh-normalize-invisible: activated (replacement=, reasoning=on, toolArgs=off, logFile=~/.dsh/hook-dsh-normalize-invisible.log)
hook-dsh-normalize-invisible: normalized N invisible char(s) in one stream
```

The empty default replacement renders as the empty `replacement=`. The activation line is written by
`apply()`; the count line only follows a normal stream completion and only when N > 0 (a thrown-away
stream writes no ledger line).

---

## License 📜

CC0-1.0.

[dsh-llm]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts
[dsh-fs]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts
