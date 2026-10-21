---
title: 03-normalize - the model's typography, tamed live
category: Diagram
kind: reference
date: 2026-10-21
status: active
---

# 03-normalize

> **The capability.** The model's typography is rewritten as it streams: em dashes, curly quotes, the ellipsis, unicode spaces, zero-width characters and full-width forms become their ASCII counterparts in the live UI and the durable transcript, at the moment the model emits them. The rewrite is deliberately visible - it *is* the feature. Six families run as six independent stream hooks, and the seventh applies all six to a file already on disk, writing only when something changed.

## The harness surfaces

| Surface | Direction | What the group does there |
| --- | --- | --- |
| `llm/stream` | listens | The six stream flavors register one waterfall listener each; `next()` is called first and `options` is never touched. The listener wraps the upstream chunk stream and rewrites text fields per chunk. |
| `tools/post-execute` | listens | The optional tool-results overpass arm (`scopes.toolResults`, default off) normalizes text blocks in tool results, prepended so CCR compresses the normalized bytes. |
| `agent/pre-step` | listens | The optional step-batch overpass arm (`scopes.batch`, default off) normalizes the incoming batch, text blocks only. |
| tool execution surface | registers | The dash flavor registers `raw-write` (explicit `normalize` parameter, default verbatim); the normalize-file bundle registers `normalize-file`. |
| loader / service surface | registers + injects | One `insert:` row per bundle; the flavors inject `["pluginFactory"]`, the dash flavor adds `fs` and `tools`. |

## The packages

| Package | Tree | Role | Trigger | Ledger file | Diagram |
| --- | --- | --- | --- | --- | --- |
| `@playform/hook-dsh-normalize-dash` | Classic | stream | `llm/stream` | `~/.dsh/hook-dsh-normalize-dash.log` | [dash.mmd](Classic/dash.mmd) ([SVG](Classic/dash.svg)) |
| `@playform/hook-dsh-normalize-quotes` | Classic | stream | `llm/stream` | `~/.dsh/hook-dsh-normalize-quotes.log` | [quotes.mmd](Classic/quotes.mmd) ([SVG](Classic/quotes.svg)) |
| `@playform/hook-dsh-normalize-ellipsis` | Classic | stream | `llm/stream` | `~/.dsh/hook-dsh-normalize-ellipsis.log` | [ellipsis.mmd](Classic/ellipsis.mmd) ([SVG](Classic/ellipsis.svg)) |
| `@playform/hook-dsh-normalize-spaces` | Classic | stream | `llm/stream` | `~/.dsh/hook-dsh-normalize-spaces.log` | [spaces.mmd](Classic/spaces.mmd) ([SVG](Classic/spaces.svg)) |
| `@playform/hook-dsh-normalize-invisible` | Classic | stream | `llm/stream` | `~/.dsh/hook-dsh-normalize-invisible.log` | [invisible.mmd](Classic/invisible.mmd) ([SVG](Classic/invisible.svg)) |
| `@playform/hook-dsh-normalize-fullwidth` | Classic | stream | `llm/stream` | `~/.dsh/hook-dsh-normalize-fullwidth.log` | [fullwidth.mmd](Classic/fullwidth.mmd) ([SVG](Classic/fullwidth.svg)) |
| `@playform/plugin-dsh-normalize-file` | Classic | tool | the `normalize-file` call | `~/.dsh/plugin-dsh-normalize-file.log` | [normalize-file.mmd](Classic/normalize-file.mmd) ([SVG](Classic/normalize-file.svg)) |
| `@playform/ets-hook-dsh-normalize-dash` | EffectTS | stream | `llm/stream` | `~/.dsh/ets-hook-dsh-normalize-dash.log` | [dash.mmd](EffectTS/dash.mmd) ([SVG](EffectTS/dash.svg)) |
| `@playform/ets-hook-dsh-normalize-quotes` | EffectTS | stream | `llm/stream` | `~/.dsh/ets-hook-dsh-normalize-quotes.log` | [quotes.mmd](EffectTS/quotes.mmd) ([SVG](EffectTS/quotes.svg)) |
| `@playform/ets-hook-dsh-normalize-ellipsis` | EffectTS | stream | `llm/stream` | `~/.dsh/ets-hook-dsh-normalize-ellipsis.log` | [ellipsis.mmd](EffectTS/ellipsis.mmd) ([SVG](EffectTS/ellipsis.svg)) |
| `@playform/ets-hook-dsh-normalize-spaces` | EffectTS | stream | `llm/stream` | `~/.dsh/ets-hook-dsh-normalize-spaces.log` | [spaces.mmd](EffectTS/spaces.mmd) ([SVG](EffectTS/spaces.svg)) |
| `@playform/ets-hook-dsh-normalize-invisible` | EffectTS | stream | `llm/stream` | `~/.dsh/ets-hook-dsh-normalize-invisible.log` | [invisible.mmd](EffectTS/invisible.mmd) ([SVG](EffectTS/invisible.svg)) |
| `@playform/ets-hook-dsh-normalize-fullwidth` | EffectTS | stream | `llm/stream` | `~/.dsh/ets-hook-dsh-normalize-fullwidth.log` | [fullwidth.mmd](EffectTS/fullwidth.mmd) ([SVG](EffectTS/fullwidth.svg)) |
| `@playform/ets-plugin-dsh-normalize-file` | EffectTS | tool | the `normalize-file` call | `~/.dsh/ets-plugin-dsh-normalize-file.log` | [normalize-file.mmd](EffectTS/normalize-file.mmd) ([SVG](EffectTS/normalize-file.svg)) |

## How each plugin works

### @playform/hook-dsh-normalize-dash

**Classic.** What it does. The dash flavor maps the unicode dash family to ASCII hyphen-minus: the em dash, the en dash, the U+2010-U+2015 family and seventeen exotic relatives (Armenian hyphen, Hebrew maqaf, Mongolian soft hyphen, double oblique hyphen, two- and three-em dash, wave dash, the vertical presentation dashes, fullwidth hyphen-minus). It also registers `raw-write`.

**The chain.**
1. `llm/stream` fires; the listener calls `next()` unconditionally and never touches `options`.
2. The async generator dispatches per chunk: text always rewrites, reasoning behind `normalizeReasoning`, tool arguments behind `normalizeToolArguments` with the `edit` / `raw-write` / `normalize-file` exemptions and the `{"__normalize":false` marker.
3. `Replace(text, Dashes, replacement)` runs a fresh regex with a function replacer; `count === 0` keeps the chunk by identity.
4. On normal completion with `N > 0`, the module appends `normalized N dash char(s) in one stream`.

**The config that matters.** `replacement` (`-`, volatile), `normalizeReasoning` (`true`), `normalizeToolArguments` (`false`; the shipped row turns it on), `logFile` (`~/.dsh/hook-dsh-normalize-dash.log`).

**The safety.** An upstream throw propagates unchanged and writes no line; the single-character rewrite cannot disagree with whole-text application.

**The ledger.** `~/.dsh/hook-dsh-normalize-dash.log`: activation (`activated (replacement=-, reasoning=on, toolArgs=off, logFile=...)`), the count line, and the overpass lines.

**The diagram.** [dash.mmd](Classic/dash.mmd) and ([SVG](Classic/dash.svg)).

### @playform/hook-dsh-normalize-quotes

**Classic.** What it does. The quotes flavor maps eight typographic quote code points - U+2018, U+2019, U+201A, U+201B to `'`, and U+201C, U+201D, U+201E, U+201F to `"` - through the core's `Quotes` map. It has no `replacement` knob.

**The chain.**
1. `llm/stream` fires; `next()` is called first, then the per-chunk dispatch reaches the text arm, the reasoning arm behind `normalizeReasoning`, and the tool-args arm behind `normalizeToolArguments`.
2. `ReplaceMap(text, Quotes)` substitutes one code point at a time through a function replacer.
3. A zero count keeps the chunk by identity; on normal completion with `N > 0` the module appends `normalized N quote char(s) in one stream`.

**The config that matters.** `normalizeReasoning` (`true`), `normalizeToolArguments` (`false`; the row turns it on), `logFile` (`~/.dsh/hook-dsh-normalize-quotes.log`).

**The safety.** The map is quote-only: an em dash belongs to the dash flavor and stays untouched.

**The ledger.** `~/.dsh/hook-dsh-normalize-quotes.log`: activation (`activated (reasoning=on, toolArgs=off, logFile=...)`) and the count line.

**The diagram.** [quotes.mmd](Classic/quotes.mmd) and ([SVG](Classic/quotes.svg)).

### @playform/hook-dsh-normalize-ellipsis

**Classic.** What it does. The ellipsis flavor matches exactly U+2026 and replaces it with `...`. A pre-existing three-dot run and Unicode's other ellipsis forms are never touched.

**The chain.**
1. `llm/stream` fires; `next()` is called first, then the per-chunk dispatch reaches the text, reasoning and tool-args arms.
2. `Replace(text, Ellipsis, replacement)` substitutes each U+2026; each replaced code point counts once even though the default emits three characters.
3. On normal completion with `N > 0`, the module appends `normalized N ellipsis char(s) in one stream`.

**The config that matters.** `replacement` (`...`), `normalizeReasoning` (`true`), `normalizeToolArguments` (`false`), `logFile` (`~/.dsh/hook-dsh-normalize-ellipsis.log`).

**The safety.** No lookahead, no context.

**The ledger.** `~/.dsh/hook-dsh-normalize-ellipsis.log`: activation (`activated (replacement=..., reasoning=on, toolArgs=off, logFile=...)`) and the count line.

**The diagram.** [ellipsis.mmd](Classic/ellipsis.mmd) and ([SVG](Classic/ellipsis.svg)).

### @playform/hook-dsh-normalize-spaces

**Classic.** What it does. The spaces flavor maps Unicode's Zs category minus the ASCII space to the plain space: U+00A0, U+1680, U+2000 through U+200A, U+202F, U+205F and U+3000. Tabs and newlines are not spaces and never match.

**The chain.**
1. `llm/stream` fires; `next()` is called first, then the per-chunk dispatch reaches the text, reasoning and tool-args arms.
2. `Replace(text, Spaces, replacement)` substitutes each space character with the configured string.
3. A zero count keeps the chunk by identity; on normal completion with `N > 0` the module appends `normalized N space char(s) in one stream`.

**The config that matters.** `replacement` (`" "`), `normalizeReasoning` (`true`), `normalizeToolArguments` (`false`), `logFile` (`~/.dsh/hook-dsh-normalize-spaces.log`).

**The safety.** The class is exactly Zs-minus-ASCII.

**The ledger.** `~/.dsh/hook-dsh-normalize-spaces.log`: activation (`activated (replacement= , reasoning=on, toolArgs=off, logFile=...)`) and the count line.

**The diagram.** [spaces.mmd](Classic/spaces.mmd) and ([SVG](Classic/spaces.svg)).

### @playform/hook-dsh-normalize-invisible

**Classic.** What it does. The invisible flavor removes the zero-width and format characters: soft hyphen U+00AD, zero-width space U+200B, the joiners U+200C and U+200D, the marks U+200E and U+200F, the bidi controls U+202A through U+202E, the word joiner U+2060 and the BOM U+FEFF. The default `replacement` is empty, so removal is the replacement.

**The chain.**
1. `llm/stream` fires; `next()` is called first, then the per-chunk dispatch reaches the text, reasoning and tool-args arms.
2. `Replace(text, Invisible, replacement)` deletes each matched code point when the replacement is empty.
3. A zero count keeps the chunk by identity; on normal completion with `N > 0` the module appends `normalized N invisible char(s) in one stream`.

**The config that matters.** `replacement` (`""` - removal), `normalizeReasoning` (`true`), `normalizeToolArguments` (`false`), `logFile` (`~/.dsh/hook-dsh-normalize-invisible.log`).

**The safety.** The characters are deleted, not rewritten to a glyph, so a spoofed identifier loses its payload.

**The ledger.** `~/.dsh/hook-dsh-normalize-invisible.log`: activation (`activated (replacement=, reasoning=on, toolArgs=off, logFile=...)`) and the count line.

**The diagram.** [invisible.mmd](Classic/invisible.mmd) and ([SVG](Classic/invisible.svg)).

### @playform/hook-dsh-normalize-fullwidth

**Classic.** What it does. The fullwidth flavor maps the whole FULLWIDTH FORMS range U+FF01 through U+FF5E to its ASCII half-width counterpart - 94 entries covering punctuation, digits, capitals and small letters. It uses the core's `Fullwidth` map and has no `replacement` knob.

**The chain.**
1. `llm/stream` fires; `next()` is called first, then the per-chunk dispatch reaches the text, reasoning and tool-args arms.
2. `ReplaceMap(text, Fullwidth)` substitutes one full-width code point at a time.
3. A zero count keeps the chunk by identity; on normal completion with `N > 0` the module appends `normalized N fullwidth char(s) in one stream`.

**The config that matters.** `normalizeReasoning` (`true`), `normalizeToolArguments` (`false`), `logFile` (`~/.dsh/hook-dsh-normalize-fullwidth.log`).

**The safety.** The range is exact: U+3000 belongs to the spaces flavor.

**The ledger.** `~/.dsh/hook-dsh-normalize-fullwidth.log`: activation (`activated (reasoning=on, toolArgs=off, logFile=...)`) and the count line.

**The diagram.** [fullwidth.mmd](Classic/fullwidth.mmd) and ([SVG](Classic/fullwidth.svg)).

### @playform/plugin-dsh-normalize-file

**Classic.** What it does. The bundle registers the `normalize-file` tool: one agent-chosen file per call is read, the six transforms are applied in the family's fixed order, and the content is written back through the factory's shared write executor only when the count is greater than zero. It registers no event listener.

**The chain.**
1. The agent calls `normalize-file { file_path }`; `ctx.fs.resolve` turns the path into a stable target.
2. `ctx.fs.readText` reads it; a missing file, a directory, a binary target, a permission failure or an abort rejects with an error result and no write.
3. `Rewrite(content, replacement)` runs Dashes, Quotes, Ellipsis, Spaces, Invisible and Fullwidth in that order, summing each count into `N`.
4. `N == 0` writes nothing and returns `changed: false`; otherwise `Factory.Write` writes with the call's exec as the actor and emits `fs/observed`, and the result carries `{ path, count, changed, before, after }`.

**The config that matters.** `logFile` (`~/.dsh/plugin-dsh-normalize-file.log`), `replacement` (`"-"` - the dash step's replacement). The minimal `shared: false` block plus the two knobs is the whole surface.

**The safety.** The tool is name-exempt in the stream gate beside `edit` and `raw-write`; its writes emit `fs/observed`, but `normalize-file` is never in a governor's `mutationTools`, so no chain pass runs.

**The ledger.** `~/.dsh/plugin-dsh-normalize-file.log`: activation and the pass line (`normalized N char(s) in <path>`); an `N = 0` call writes neither.

**The diagram.** [normalize-file.mmd](Classic/normalize-file.mmd) and ([SVG](Classic/normalize-file.svg)).

### @playform/ets-hook-dsh-normalize-dash

**EffectTS twin.** The exact package is `@playform/ets-hook-dsh-normalize-dash`, built on `@playform/ets-base-dsh`, `@playform/ets-lib-dsh-core` and the `@playform/ets-plugin-dsh-factory` service. The Effect delta is the stream pipeline: the Classic async-generator wrapper becomes the base's real `Stream/Gate` transformer, adapted with `Stream.fromAsyncIterable(Next(), onError)` and an identity `onError`, and the module keeps only the `OnCount` callback, run as the final non-emitting section. Per-stream state lives in the Gate's `Stream.suspend` closure; the line is byte-identical and the ledger is `~/.dsh/ets-hook-dsh-normalize-dash.log`. The diagram is [dash.mmd](EffectTS/dash.mmd) and ([SVG](EffectTS/dash.svg)).

### @playform/ets-hook-dsh-normalize-quotes

**EffectTS twin.** The exact package is `@playform/ets-hook-dsh-normalize-quotes`, built on the same three ETS packages. The delta is the same shape: `Stream.fromAsyncIterable` into the base's `Stream/Gate`, the `Quotes` map as the flavor, and the `OnCount` callback as the final non-emitting section, so an abandoned stream writes no line. The strings are byte-identical and the ledger is `~/.dsh/ets-hook-dsh-normalize-quotes.log`. The diagram is [quotes.mmd](EffectTS/quotes.mmd) and ([SVG](EffectTS/quotes.svg)).

### @playform/ets-hook-dsh-normalize-ellipsis

**EffectTS twin.** The exact package is `@playform/ets-hook-dsh-normalize-ellipsis`, built on the same three ETS packages. The Gate transformer owns the per-chunk dispatch and the three-way tool-args gate; the module supplies the `Ellipsis` transform and the count callback. The line is byte-identical and the ledger is `~/.dsh/ets-hook-dsh-normalize-ellipsis.log`. The diagram is [ellipsis.mmd](EffectTS/ellipsis.mmd) and ([SVG](EffectTS/ellipsis.svg)).

### @playform/ets-hook-dsh-normalize-spaces

**EffectTS twin.** The exact package is `@playform/ets-hook-dsh-normalize-spaces`, built on the same three ETS packages. The pipeline is the shared `Stream/Gate`; the flavor supplies the `Spaces` table and the count callback, and the accumulator lives in the Gate's `Stream.suspend` closure so concurrent streams never share it. The line is byte-identical and the ledger is `~/.dsh/ets-hook-dsh-normalize-spaces.log`. The diagram is [spaces.mmd](EffectTS/spaces.mmd) and ([SVG](EffectTS/spaces.svg)).

### @playform/ets-hook-dsh-normalize-invisible

**EffectTS twin.** The exact package is `@playform/ets-hook-dsh-normalize-invisible`, built on the same three ETS packages. The Gate transformer and the `Invisible` table do the work; the module keeps the count callback. The line is byte-identical and the ledger is `~/.dsh/ets-hook-dsh-normalize-invisible.log`. The diagram is [invisible.mmd](EffectTS/invisible.mmd) and ([SVG](EffectTS/invisible.svg)).

### @playform/ets-hook-dsh-normalize-fullwidth

**EffectTS twin.** The exact package is `@playform/ets-hook-dsh-normalize-fullwidth`, built on the same three ETS packages. The pipeline is the base's `Stream/Gate`, the flavor is the `Fullwidth` map, and the module's only residue is the count callback and its strings. The line is byte-identical and the ledger is `~/.dsh/ets-hook-dsh-normalize-fullwidth.log`. The diagram is [fullwidth.mmd](EffectTS/fullwidth.mmd) and ([SVG](EffectTS/fullwidth.svg)).

### @playform/ets-plugin-dsh-normalize-file

**EffectTS twin.** The exact package is `@playform/ets-plugin-dsh-normalize-file`, built on the same three ETS packages. It has no Effect-native stage of its own: the tool reads through `ctx.fs`, applies the same six transforms in the same order, and writes through the factory's shared executor, which in the ETS tree is the Effect-backed `WriteService`. The line is byte-identical and the ledger is `~/.dsh/ets-plugin-dsh-normalize-file.log`. The diagram is [normalize-file.mmd](EffectTS/normalize-file.mmd) and ([SVG](EffectTS/normalize-file.svg)).

## How the group composes

All six stream flavors share the `llm/stream` waterfall. Each wraps the downstream result and always calls `next()`, so it composes regardless of registration order. Because every transform is a per-chunk, single-character replacement with no lookahead and no multi-character sequence, the flavors are **order-independent** and **chunk-boundary-safe**: the dash pass before or after the quotes pass produces the same bytes.

`normalizeReasoning` defaults **on** - the deltas and the assembled reasoning block must agree. `normalizeToolArguments` defaults **off**, because tool-call arguments are execution-critical raw JSON; with it on, the gate exempts `edit`, `raw-write` and `normalize-file` by name, plus any call opening with the `{"__normalize":false` marker. The shipped rows turn it on as an explicit opt-in.

`normalize-file` is the on-disk sibling: same six transforms, same order, one whole-file pass, no-op no-write. `raw-write` is the per-call opt-in: `normalize` absent or `false` writes verbatim, `true` or `"all"` applies all six, an array applies only the named flavors.

The `scopes` object gates every arm independently and is entirely volatile (`conversation` on, `reasoning` on, `toolInput` off, `toolResults` off, `files` on, `batch` off); one grouped override turns the whole family off in one edit. `toolResultsExempt` keeps a listed tool's result byte-exact.

Activating one flavor never implies another. Six flavors, six ledgers, six activation lines.

## How it plugs into the harness

Each stream bundle is one `insert:` row with `log: true`, its `logFile`, its `replacement` where it has one, and `normalizeReasoning: true`. The flavors inject `["pluginFactory"]`; the dash flavor adds `fs` and `tools` for `raw-write`, and normalize-file adds all three. The listener is a plain `ctx.on("llm/stream", ...)`, fiber-owned and removed on unload; the factory's `Wire` is not used because it is `fs/observed`-hardwired and this rewrite must be visible. Boot order is: profile bundles → factory service → each flavor registers and writes its activation line. A `file:` dependency alone is not activation: the package must be in `dsh.profile.bundles` and the host restarted.

## What the user experiences

- Em dashes, curly quotes and ellipses become `-`, `'`/`"` and `...` as they stream, in the live UI and the transcript.
- Zero-width and bidi characters disappear, so a spoofed identifier cannot hide payload.
- A full-width sentence is rendered half-width without a second pass.
- A pre-existing file can be normalized on demand; a file with nothing to change is untouched.
- Tool-call arguments stay byte-exact unless the user opts in.

## Sources

- Six Classic flavors: [dash](../../Classic/packages/hook-dsh-normalize-dash/README.md) ([SCHEME](../../Classic/packages/hook-dsh-normalize-dash/SCHEME.md), [patch](../../Classic/packages/hook-dsh-normalize-dash/cordis.patch.yml)), [quotes](../../Classic/packages/hook-dsh-normalize-quotes/README.md) ([patch](../../Classic/packages/hook-dsh-normalize-quotes/cordis.patch.yml)), [ellipsis](../../Classic/packages/hook-dsh-normalize-ellipsis/README.md) ([patch](../../Classic/packages/hook-dsh-normalize-ellipsis/cordis.patch.yml)), [spaces](../../Classic/packages/hook-dsh-normalize-spaces/README.md) ([patch](../../Classic/packages/hook-dsh-normalize-spaces/cordis.patch.yml)), [invisible](../../Classic/packages/hook-dsh-normalize-invisible/README.md) ([patch](../../Classic/packages/hook-dsh-normalize-invisible/cordis.patch.yml)), [fullwidth](../../Classic/packages/hook-dsh-normalize-fullwidth/README.md) ([patch](../../Classic/packages/hook-dsh-normalize-fullwidth/cordis.patch.yml)).
- [normalize-file README](../../Classic/packages/plugin-dsh-normalize-file/README.md), [cordis.patch.yml](../../Classic/packages/plugin-dsh-normalize-file/cordis.patch.yml)
- [ets normalize-dash README](../../EffectTS/packages/ets-hook-dsh-normalize-dash/README.md), [SCHEME.md](../../EffectTS/packages/ets-hook-dsh-normalize-dash/SCHEME.md), [cordis.patch.yml](../../EffectTS/packages/ets-hook-dsh-normalize-dash/cordis.patch.yml)
- [ets normalize-file README](../../EffectTS/packages/ets-plugin-dsh-normalize-file/README.md), [cordis.patch.yml](../../EffectTS/packages/ets-plugin-dsh-normalize-file/cordis.patch.yml)
