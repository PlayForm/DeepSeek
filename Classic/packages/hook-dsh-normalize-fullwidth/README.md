# @playform/hook-dsh-normalize-fullwidth

*The DeepSeek Harness Plugin Family for PlayForm.*

[![npm](https://img.shields.io/static/v1?label=npm&message=%40playform%2Fhook-dsh-normalize-fullwidth&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-normalize-fullwidth)
[![release](https://img.shields.io/static/v1?label=release&message=v0.0.1&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-normalize-fullwidth)
[![variant](https://img.shields.io/static/v1?label=variant&message=CLASSIC&color=blue)](../../README.md)
[![sibling](https://img.shields.io/static/v1?label=sibling&message=EFFECT-TS&color=white)](../../README.md)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

> [!NOTE]
>
> The **fullwidth normalizer for model output** - a DeepSeek Harness plugin that hooks the
> [`llm/stream`][dsh-llm] waterfall (the interceptable wrapper around EVERY streaming model call, bound to the
> [LlmRuntime][dsh-llm]) and normalizes the full-width family in model output, live in the transcript: the
> entire FULLWIDTH FORMS range U+FF01-U+FF5E maps to its ASCII half-width counterpart
> U+0021-U+007E - the whole story, letters, punctuation and digits included.
>
> *A MAP flavor of the normalize family: the core's `Fullwidth` char-to-char table owns the
> substitution - no `replacement` config knob.*
>
> *The @-sentence identity: **Hook @ DSH @ Normalize @
> Fullwidth**.*
>
> *The family's `raw-write` tool (registered by
> [`hook-dsh-normalize-dash`](../hook-dsh-normalize-dash)) bypasses this flavor's transforms too -
> the exemption is family-wide: the core's `Stream/Chunk` + `Stream/Block` pass every `raw-write`
> call through by identity, so the tool's explicit `normalize` parameter (default false = verbatim)
> is the only normalization it applies.*

---

## Where It Fits

**Family position** (the @-sentence **Hook @ DSH @ Normalize @ Fullwidth**): a hook child of the
[`dsh-plugin-factory`](../dsh-plugin-factory) service and the [`hook-dsh-core`](../hook-dsh-core)
machinery; the sixth of the six stream normalizer siblings.

One of **six siblings** in the stream-normalization family, all built on the shared machinery -
[`dsh-plugin-factory`](../dsh-plugin-factory) for `State`/`Append` (and the named `Schema` helper,
`shared: false`, for the config), [`hook-dsh-core`](../hook-dsh-core) for the `Fullwidth` table and
the generic `ReplaceMap`/`Chunk`/`Block` dispatch:

| flavor                                                            | table                  | substitution                  |
| ----------------------------------------------------------------- | ---------------------- | ----------------------------- |
| [`hook-dsh-normalize-dash`](../hook-dsh-normalize-dash)           | core `Dashes` class    | `→ replacement` (default `-`) |
| [`hook-dsh-normalize-quotes`](../hook-dsh-normalize-quotes)       | core `Quotes` MAP      | curly → straight              |
| [`hook-dsh-normalize-ellipsis`](../hook-dsh-normalize-ellipsis)   | core `Ellipsis` class  | U+2026 → `...`                |
| [`hook-dsh-normalize-spaces`](../hook-dsh-normalize-spaces)       | core `Spaces` class    | unicode spaces → `" "`        |
| [`hook-dsh-normalize-invisible`](../hook-dsh-normalize-invisible) | core `Invisible` class | removed (default `""`)        |
| [hook-dsh-normalize-fullwidth](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-fullwidth/Source) (this bundle)                      | core `Fullwidth` MAP   | full-width → half-width       |

A **non-manifest factory consumer**: it injects `["pluginFactory"]` and uses `State` (cell
unwrap + shared `Ledger`/`Enabled` mappings + its own fields), `Append` and
`Journal` (the shared P5 record on every N > 0 pass); the config is composed
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
pnpm add @playform/hook-dsh-normalize-fullwidth
```

1. **Remote / dependency install (auto-activation):**
   `pnpm add @playform/hook-dsh-normalize-fullwidth` in a profile dir (+ the package name in
   `dsh.profile.bundles`, or `dsh plugin add`) - installed automatically and activated at the next
   host start.
2. **Local git clone:** clone → `pnpm install` inside the bundle (its `pnpm-workspace.yaml` pins
   `packages: [.]` so the install lands in the bundle, not the workspace root) → build →
   `dsh plugin --profile <name> add <this directory>`.
3. **Tarball / npm**: `dsh plugin --profile <name> add <tarball-or-spec>` - the package ships built
   `Target/` (minified, `.d.ts` twins), so no build runs at install time.

Verify with the `hook-dsh-normalize-fullwidth: activated (...)` ledger line.

### Usage

The bundle is configured through its [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-fullwidth/cordis.patch.yml) row (or the profile's `dsh.bundle`
manifest) - the full config table is in [The Config](#the-config):

```yaml
- insert:
      - id: hook-dsh-normalize-fullwidth
        name: "@playform/hook-dsh-normalize-fullwidth"
        config:
            log: true
            logFile: ~/.dsh/hook-dsh-normalize-fullwidth.log
            normalizeReasoning: true
```

---

## The Problem

CJK input methods emit full-width punctuation, digits and letters - and a full-width comma or digit
in a command, code block or path is invisible on screen and wrong for every parser, shell and diff.

This flavor maps the whole fullwidth range to the unambiguous ASCII half-width forms before it
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
       ├─ text-delta ────────► ReplaceMap(text, Fullwidth)  rewrite the text field
       ├─ reasoning-delta ───► same, when normalizeReasoning (default ON)
       ├─ block-end ─────────► the assembled block's text fields -
       │                       TextBlock.text / ReasoningBlock.text (plus a
       │                       runtime `thinking` string field) - the deltas
       │                       AND the block must agree, or consumers see
       │                       inconsistencies
       ├─ tool-call-delta ───► ReplaceMap(argumentsDelta, Fullwidth) when
       │                       normalizeToolArguments (IMPLEMENTED, default
       │                       OFF - execution-critical raw JSON, the user's
       │                       accepted risk; the example patch turns it
       │                       on) - the assembled ToolCallBlock.arguments
       │                       follows the same flag via block-end
       │                       The gate is THREE-WAY with the flag on: a
       │                       delta/block whose `name` is "edit", "raw-write"
       │                       or "normalize-file" passes through BY IDENTITY
       │                       (the edit tool's `old_string` must match the real
       │                       file bytes; the raw-write tool owns its content
       │                       normalization; the normalize-file tool's arguments
       │                       carry a file path - a normalized dash inside a
       │                       filename would corrupt the target),
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
  Factory.Append ──► `hook-dsh-normalize-fullwidth: normalized N fullwidth char(s) in one stream`
```

### The transform

Exactly the core's `Fullwidth` map ([@playform/hook-dsh-core](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-core/Source)'s `Normalize/Fullwidth`), applied per
text segment through the core's `ReplaceMap` - the standard fullwidth-to-halfwidth mapping over the
whole range, described by code point here (the literal characters are in the In Action block below):

| Code point    | Contents                                                   | ASCII             |
| ------------- | ---------------------------------------------------------- | ----------------- |
| U+FF01-U+FF0F | full-width punctuation (exclamation through solidus)       | `!"#$%&'()*+,-./` |
| U+FF10-U+FF19 | full-width digits zero through nine                        | `0123456789`      |
| U+FF1A-U+FF20 | full-width punctuation (colon through commercial at)       | `:;<=>?@`         |
| U+FF21-U+FF3A | full-width capitals A through Z                            | `A-Z`             |
| U+FF3B-U+FF40 | full-width punctuation (left square bracket through grave) | `[\]^_`` `        |
| U+FF41-U+FF5A | full-width small letters a through z                       | `a-z`             |
| U+FF5B-U+FF5E | full-width punctuation (left curly brace through tilde)    | `{\|}~`           |

- **No context rules** - one character in, its half-width counterpart out.
- **Chunk-boundary-safe**: single-character substitution, no lookahead - per-chunk application can
  never disagree with whole-text application.
- The mapping values are returned through a **function replacer**, so they are inserted literally
  (no `$`-pattern interpretation - the table's backslash, circumflex, vertical bar and tilde values
  are exactly the characters a string replacement would corrupt).
- Replaced characters are **counted per stream** for the ledger line.

---

## The Pitfalls

- **The range is exact** - only U+FF01-U+FF5E maps to its ASCII half-width counterpart; the
  fullwidth space U+3000 is the spaces flavor's character, not this table's.
- **A dependency alone is NOT activation** - the package must be in `dsh.profile.bundles` (or the
  patch row inserted), or no listener registers and no ledger exists.
- **The stream gate rewrites model output only** - it never touches disk; files already on disk are
  the `normalize-file` tool's job.
- **The count is per replaced code point** - N counts matched characters; N = 0 and an upstream
  throw both write no count line and no journal record.

## The Config

| Field                    | Type    | Default                                   | Volatile | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------ | ------- | ----------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `log`                    | boolean | `true`                                    | yes      | write the durable ledger file                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `logFile`                | string  | `~/.dsh/hook-dsh-normalize-fullwidth.log` | yes      | the fullwidth ledger (separate from the family's logs)                                                                                                                                                                                                                                                                                                                                                                                                              |
| `normalizeReasoning`     | boolean | `true`                                    | no       | normalize reasoning deltas and the assembled reasoning block too                                                                                                                                                                                                                                                                                                                                                                                                    |
| `normalizeToolArguments` | boolean | `false`                                   | no       | IMPLEMENTED (default OFF): rewrite the tool-call argumentsDelta and the assembled ToolCallBlock.arguments when on (with three exemptions: `edit`, `raw-write` and `normalize-file` calls pass through by identity (the edit tool's `old_string` must match the real file bytes; the raw-write tool owns its content normalization through its explicit `normalize` parameter; the normalize-file tool's arguments carry a file path - a normalized dash inside a filename would corrupt the target); and a call whose arguments open with the `{"__normalize":false` first-key marker passes through unnormalized, the marker entry stripped) - execution-critical raw JSON, the user's accepted risk; the example patch turns it on |

There is **no `replacement` field** (MAP flavor).

Volatile cells commit without remounting the
plugin; the factory's State builder unwraps them defensively.

---

## In Action

One stream, one transformation.

The model emits CJK-typing artifacts - a full-width word, a
full-width path punctuation run, a full-width digit; the live UI and the transcript receive the
half-width ASCII forms:

```text
text-delta in (what the model wrote):

  path "／ｕｓｒ／ｌｏｃａｌ／ｂｉｎ" — version １２３ — done!

text-delta out (what reaches the transcript):

  path "/usr/local/bin" — version 123 — done!
```

Every full-width code point in the incoming text - the solidus U+FF0F, the letters U+FF55-U+FF4E,
the digits U+FF11-U+FF13 and the exclamation U+FF01 - becomes its U+0021-U+007E half-width
counterpart; ASCII characters that were already half-width are untouched.

This is what keeps a
pasted path openable and a pasted number parseable.

The backslash, circumflex, vertical bar and
tilde entries are exactly the characters a naive string replacement would corrupt - hence the
function replacer.

When a stream finishes normally with replacements made, the ledger gets the count
line:

```text
hook-dsh-normalize-fullwidth: normalized 4 fullwidth char(s) in one stream
```

(The same pass runs over reasoning deltas when `normalizeReasoning` is on, and over tool-call
arguments when the example patch enables `normalizeToolArguments` - with the `edit`, `raw-write` and `normalize-file` names exempt and
raw-marker calls passing through unnormalized.)

---

## The Ledger

Two lines, both written through the factory's `Append` (the hook-dsh-normalize-fullwidth: prefix
is the logger's `<State.Module>:`; the durable file line is `[<ISO>] <message>`):

```text
hook-dsh-normalize-fullwidth: activated (reasoning=on, toolArgs=off, logFile=~/.dsh/hook-dsh-normalize-fullwidth.log)
hook-dsh-normalize-fullwidth: normalized N fullwidth char(s) in one stream
```

The activation line is written by `apply()`; the count line only follows a normal stream completion
and only when N > 0 (a thrown-away stream writes no ledger line).

Every N > 0 pass also journals one `normalized` record into the shared `package_governance` v2
domain - event `normalized`, path = the empty stream-level path, detail byte-identical to the
count line - best-effort: with no storage facility the record buffers or drops, and the human
ledger stays the complete record.

---

## The variant toggle (CLASSIC vs EFFECT-TS)

One name, two builds: this package ships BOTH implementations in the same tarball - `Target/`
(the CLASSIC build - plain TypeScript, the default) and `Target-EffectTS/` (the EFFECT-TS build -
effect-backed, the same contract). Install ONCE and toggle at the LOADER level - no postinstall
builds, no user-side compilation:

- **The default is the CLASSIC build.** `import ... from "@playform/hook-dsh-normalize-fullwidth"` resolves to
  `Target/` with zero framework dependencies.
- **The whole-family toggle to the EFFECT-TS build** - one flag, applied to every
  `@playform/dsh-hook-*` package at once (the family stays coherent - never mix variants in one
  graph):
  - Node: `node --conditions=effect-ts` (or `NODE_OPTIONS="--conditions=effect-ts"`).
  - TypeScript: `"customConditions": ["effect-ts"]` in `compilerOptions` (TS 5.0+).
  - esbuild: `conditions: ["effect-ts"]`; Vite: `resolve.conditions: ["effect-ts"]`; webpack:
    `resolve.conditionNames: ["effect-ts"]`.
- **The per-import escape hatch** (no loader config at all): `import ... from
  "@playform/hook-dsh-normalize-fullwidth/effect-ts"` (or `/classic`) - deterministic in every toolchain.

`effect` v4.0.2 ships as a dependency so the EFFECT-TS build resolves with the same single install
(the CLASSIC build never imports it).

## License 📜

CC0-1.0.

[dsh-llm]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts
[dsh-fs]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts
