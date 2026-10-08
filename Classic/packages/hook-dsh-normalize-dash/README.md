# @playform/hook-dsh-normalize-dash

_The DeepSeek Harness Plugin Family for PlayForm._

[![npm](https://img.shields.io/static/v1?label=npm&message=%40playform%2Fhook-dsh-normalize-dash&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-normalize-dash)
[![release](https://img.shields.io/static/v1?label=release&message=v0.0.1&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-normalize-dash)
[![variant](https://img.shields.io/static/v1?label=variant&message=CLASSIC&color=blue)](../../README.md)
[![sibling](https://img.shields.io/static/v1?label=sibling&message=EFFECT-TS&color=white)](../../README.md)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

> [!NOTE]
>
> The **dash normalizer for model output** - a DeepSeek Harness plugin that hooks the [`llm/stream`][dsh-llm]
> waterfall (the interceptable wrapper around EVERY streaming model call, bound to the [LlmRuntime][dsh-llm])
> and normalizes the unicode dash family to ASCII hyphen-minus, live in the transcript: em dashes,
> en dashes and seventeen exotic relatives → `-`.
>
> _The normalize-dashes hook, at the injection point the harness itself does not have._
>
> _A CLASS flavor of the normalize family: the core's `Dashes` table plus a configurable
> `replacement` (default `-`)._
>
> _It also registers the family's **`raw-write` tool** - a write wrapper
> with an explicit `normalize` parameter (default **false = verbatim**), exempt from the stream
> normalization by name like `edit`._
>
> _The @-sentence identity: **Hook @ DSH @ Normalize @ Dash**._

---

## Where It Fits

**Family position** (the @-sentence **Hook @ DSH @ Normalize @ Dash**): a hook child of the
[`plugin-dsh-factory`](../plugin-dsh-factory) service and the [`hook-dsh-core`](../hook-dsh-core)
machinery; the first of six stream normalizer siblings.

One of **six siblings** in the stream-normalization family, all built on the shared machinery -
[`plugin-dsh-factory`](../plugin-dsh-factory) for `State`/`Append` (and the named `Schema` helper,
`shared: false`, for the config), [`hook-dsh-core`](../hook-dsh-core) for the `Dashes` table and the
generic `Chunk`/`Block` dispatch.

The normalize-dash is the family's **CLASS flavor with a
`replacement` knob** - the core's `Dashes` class applied verbatim; the
siblings share the same whole-chunk replacement approach:

| flavor                                                            | table                  | substitution                  |
| ----------------------------------------------------------------- | ---------------------- | ----------------------------- |
| [hook-dsh-normalize-dash](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-dash/Source) (this bundle)                           | core `Dashes` class    | `→ replacement` (default `-`) |
| [`hook-dsh-normalize-quotes`](../hook-dsh-normalize-quotes)       | core `Quotes` MAP      | curly → straight              |
| [`hook-dsh-normalize-ellipsis`](../hook-dsh-normalize-ellipsis)   | core `Ellipsis` class  | U+2026 → `...`                |
| [`hook-dsh-normalize-spaces`](../hook-dsh-normalize-spaces)       | core `Spaces` class    | unicode spaces → `" "`        |
| [`hook-dsh-normalize-invisible`](../hook-dsh-normalize-invisible) | core `Invisible` class | removed (default `""`)        |
| [`hook-dsh-normalize-fullwidth`](../hook-dsh-normalize-fullwidth) | core `Fullwidth` MAP   | full-width → half-width       |

It is also the factory's **first NON-MANIFEST module** and its **second consumer**: it injects
`["pluginFactory"]` and uses only `State` (cell unwrap + shared `Ledger`/`Enabled` mappings + its
own fields) and `Append`.

NOT consumed, deliberately: `Wire` (fs/observed-hardwired - the family's
silence; the normalize-dash implements its own [`llm/stream`][dsh-llm] registration), `Attach` (no jobs /
inflight / storage), `Journal` (the shared P5 record on every N > 0 pass), and
the gate/write/refresh/continue machinery (no [fs/observed][dsh-fs] path).

The DSH plugin family is the DeepSeek Harness plugin layer of the PlayForm ecosystem:
TypeScript-first `Source/` → `Target/`, the deterministic `@playform` build, `prepublishOnly`-only -
the same conventions as every other @playform package.

### The Interplay

- **The governance trio and the factory**: pure additive - no shared event, no shared state. The
  STREAM listener touches no files, so [fs/write-intent][dsh-fs] and [fs/observed][dsh-fs] never see it; the `raw-write`
  TOOL does write files, and does so through the built-in write's exact fs path - resolve →
  [fs/write-intent][dsh-fs] → writeText → [fs/observed][dsh-fs] - so the governance hooks treat its writes exactly like
  built-in write calls.
- **Other [llm/stream][dsh-llm] listeners**: the normalize-dash wraps the downstream result and always calls
  `next()`, so it composes regardless of registration order; it neither short-circuits nor yields
  its own chunks.
- **Chunk identity**: untouched chunks pass through by object identity; a rewritten delta/block is a
  shallow copy with only the text field replaced (the one exception: the raw-marker strip rewrites
  the arguments text while the count stays 0 - marker removal is not normalization)

## Install

**`Terminal`** (registry)

```sh
pnpm add @playform/hook-dsh-normalize-dash
```

1. **Remote / dependency install (auto-activation):** `pnpm add @playform/hook-dsh-normalize-dash`
   in a profile dir (+ the package name in `dsh.profile.bundles`, or `dsh plugin add`) - installed
   automatically and activated at the next host start.
2. **Local git clone:** clone → `pnpm install --ignore-workspace` (the bundle carries its own
   node_modules) → build (`npx Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts`) →
   `dsh plugin --profile <name> add <this directory>`. The linked checkout must carry its own
   `node_modules`: `pnpm install --ignore-workspace` inside the bundle.
3. **Tarball / npm**: `dsh plugin --profile <name> add <tarball-or-spec>` - the package ships built
   `Target/` (minified, `.d.ts` twins), so no build runs at install time.
4. **Git**: fetches sources, not builds - requires a `prepare` script and an `allowBuilds` entry, or
   a published tarball.

Activation is at boot (bundle layers compose at host restart); verify with the
`hook-dsh-normalize-dash: activated (...)` ledger line (the `--dump-config` verification path is
gone behind the app-managed profile guard - the ledger and the runtime's inspect providers are the
activation assessors).

A file: dependency alone is NOT activation.

### Usage

The bundle is configured through its [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-dash/cordis.patch.yml) row (or the profile's `dsh.bundle`
manifest) - the full config table is in [The Config](#the-config):

```yaml
- insert:
      - id: hook-dsh-normalize-dash
        name: "@playform/hook-dsh-normalize-dash"
        config:
            log: true
            logFile: ~/.dsh/hook-dsh-normalize-dash.log
            replacement: "-"
            normalizeReasoning: true
```

---

## The Problem

The established file-hook approach rewrites the unicode dash family to ASCII hyphen-minus **in files
after the fact** - `perl -CSD -pe` over whatever was already written.

Model output, however, is born in the
stream: the live UI and the durable transcript see the em dashes first, no matter what a file hook
does later.

A DSH plugin can go where a file hook cannot: the [`llm/stream`][dsh-llm] waterfall, where every
streaming model call passes through.

Unlike the governance family ([`hook-dsh-governor-package`](../hook-dsh-governor-package),
[`hook-dsh-pinner-package`](../hook-dsh-pinner-package),
[`hook-dsh-governor-cargo`](../hook-dsh-governor-cargo)), whose rewrites are SILENT, this plugin's
normalization is **deliberately VISIBLE - it IS the feature**: the rewrite flows into both the live
UI and the durable transcript.

---

## How It Works

**`The stream pipeline`**

```text
  llm/stream waterfall (options, next)     the interceptable wrapper around
       │                                   EVERY streaming model call
       ▼  next() called FIRST, always - options never touched
  Normalize(upstream, state)               the async generator (Function/Normalize)
       │   for await (chunk of upstream)
       ▼
  CoreChunk(chunk, transform, reasoning, toolArgs, raw)
       │                                   the core's per-chunk dispatch
       │
       ├─ text-delta ────────► Replace(text, Dashes, "-")   rewrite the text field
       ├─ reasoning-delta ───► same, when normalizeReasoning (default ON)
       ├─ block-end ─────────► the assembled block's text fields -
       │                       TextBlock.text / ReasoningBlock.text (plus a
       │                       runtime `thinking` string field) - the deltas
       │                       AND the block must agree, or consumers see
       │                       inconsistencies
       ├─ tool-call-delta ───► Replace(argumentsDelta, Dashes, "-") when
       │                       normalizeToolArguments (IMPLEMENTED, default
       │                       OFF - execution-critical raw JSON, the user's
       │                       accepted risk; the example patch turns it
       │                       on) - the assembled ToolCallBlock.arguments
       │                       follows the same flag via block-end
       │
       │                       The gate is THREE-WAY with the flag on: a
       │                       delta/block whose `name` is "edit" or
       │                       "raw-write" passes through BY IDENTITY (the
       │                       edit tool's `old_string` must match the real
       │                       file bytes; the raw-write tool owns its
       │                       normalization through the explicit `normalize`
       │                       parameter), and a call whose arguments open
       │                       with the `{"__normalize":false` marker (FIRST
       │                       key, tracked per call id) passes through
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
  Factory.Append ──► `hook-dsh-normalize-dash: normalized N dash char(s) in one stream`
```

Waterfall discipline:

- **`next()` is ALWAYS called**, unconditionally, first - omitting it short-circuits the waterfall
  and the model call never happens.
- **`options` is NEVER touched**: a LOOP-built request arrives **deep-frozen** (mutation throws) and
  its content is a pure function of the session log - listeners read it, never rewrite it.
- **Order preserved, no buffering**: one chunk in, one chunk out; upstream throws propagate (the
  [LlmRuntime][dsh-llm] normalizes adapter failures to a terminal error/aborted finish - a thrown-away stream
  writes no ledger line).

### The transform

The core's `Dashes` class, verbatim - the same perl pattern (`perl -CSD -pe`), applied per text
segment:

```text
[\u058A\u05BE\u1400\u1806\u2010-\u2015\u2E17\u2E1A\u2E3A-\u2E3B\u2E40
 \u2E5D\u301C\u3030\u30A0\uFE31-\uFE32\uFE58\uFE63\uFF0D]  →  replacement
```

Armenian hyphen, Hebrew maqaf, Canadian syllabics hyphen, Mongolian todo soft hyphen, the U+2010 -
U+2015 hyphen/dash family (including the em dash and the non-breaking hyphen), double oblique
hyphen, hyphen with diaeresis, two-/ three-em dash, double hyphen, U+2E5D, wave/wavy dash,
katakana-hiragana double hyphen, the vertical presentation dashes, small em dash, small hyphen-minus
and the fullwidth hyphen-minus - all become the config `replacement` (default `-`, ASCII
hyphen-minus U+002D).

- **No context rules** - a class match and replace, no lookahead, no context.
- **Chunk-boundary-safe**: single-character replacement, no lookahead, no multi-character
  sequences - per-chunk application can never disagree with whole-text application.
- The replacement is applied with a **function replacer**, so a custom `replacement` containing `$`
  patterns is inserted literally.
- Replaced characters are **counted per stream** for the ledger line.

### The raw-write tool

Besides the stream listener, the normalize-dash registers the family's **`raw-write` tool**
(`Source/Function/Write.ts`): a plugin-registered write wrapper that wraps the built-in `write`
operation with an **explicit `normalize` parameter** - the tool is **exempt from the stream
normalization by name** (the core's `Stream/Chunk` + `Stream/Block` pass every `raw-write` call
through by identity, exactly like `edit`), so the content is what the model sent, and the
normalization decision happens at execution time:

| `normalize`                     | what the exec writes                                                                                                                                                                                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| absent or `false` (**default**) | the content **VERBATIM**, byte-for-byte                                                                                                                                                                                                                           |
| `true` or `"all"`               | the family's **SIX transforms** applied in order, daisy-chaining the text: Dashes (→ the module's `replacement`), Quotes (curly → straight), Ellipsis (U+2026 → `...`), Spaces (unicode spaces → `" "`), Invisible (removed), Fullwidth (full-width → half-width) |
| `["dash", ...]`                 | **ONLY the selected flavors**, applied in the family's fixed order (dashes → quotes → ellipsis → spaces → invisible → fullwidth); the parameter's schema declares the union (`boolean                                                                             | "all" | the flavor-name array`), because the harness tools reject unknown keys |

The tool also takes a **`govern` parameter** - the per-call governance selection over the factory's
direct-govern registry (factory SCHEME.md §2.16–§2.17), applied after a successful write:

| `govern`                        | what the exec runs                                                                                                                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| absent or `false` (**default**) | **NO governance chain** — the current posture, the "skip everything" escape hatch (the write still emits [`fs/observed`][dsh-fs] exactly like a built-in write, so the event-path hooks behave as always) |
| `true` or `"all"`               | **ALL registered governance steps** for the target's basename (`package.json`: canonicalize + update; `Cargo.toml`: cargo + update)                                                             |
| `["canonicalize", ...]`         | **ONLY the named steps** (`canonicalize`, `pin`, `cargo`, `update`); unknown names are rejected by the schema and ignored by the registry                                                       |

Governance is **best-effort and contained**: the steps run through the factory's
`Govern(target, selection, actor, version)` with the written outcome's fresh version — a failing
step never affects the write's outcome, and an empty registry makes the call a contained no-op.

The exec mirrors the **built-in write's fs path exactly** - `ctx.fs.resolve` → the [`fs/write-intent`][dsh-fs]
waterfall (the observation policy's single-slot guarded-write decision) → the standing sandbox
policy (resolved like the built-in's no-escalation path; `raw-write` advertises no escalation of its
own) → `ctx.fs.writeText(target, content, intent, exec.signal, policy)` → the [`fs/observed`][dsh-fs] emit
with the written version - so the governance family's [fs/observed][dsh-fs] chain fires for these writes the
same way it fires for built-in writes.

`exec.signal` is honored end to end (a pre-aborted call never
writes).

The registration is readonly after registration; the presenters are pure and recompute the
same selection-aware chain, so the diff card always matches the file.

Inject:
`["pluginFactory", "fs", "tools"]`.

### The Source Layout

```text
Source/Library.ts            - the loader contract (name/apply/Config/inject + default object)
Source/Function/Apply.ts     - thin wire-up: Factory.State → activation proof → ctx.on("llm/stream")
                               → ctx.tools.register(raw-write)
Source/Function/Normalize.ts - the async-generator stream wrapper + the per-stream count line
Source/Function/Chunk.ts     - the thin per-chunk dispatch (delegates to the core's generic dispatch)
Source/Function/Replace.ts   - the thin transform leaf (the core's Replace + Dashes, pinned)
Source/Function/Write.ts     - the raw-write tool definition (built, registered in Apply; never
                               mutated after registration)
Source/Function/Rewrite.ts   - the tool's selection-aware normalize step (the core's tables,
                               chained; the family's fixed order, ONLY the selected flavors)
Source/Variable/Config.ts    - the module's own Schemastery schema (the factory's standalone
                               helper with `shared: false` - the minimal block)
Source/Interface/*.ts        - Config/State shapes, the factory service view (chunk vocabulary
                               imported directly from @deepseek-ai/dsh-llm, type-only; the fs
                               vocabulary arrives through the factory's own declarations)
```

---

## The Pitfalls

- **The stream gate rewrites model output only** - it never touches disk; files already on disk are
  the `normalize-file` tool's job (or `raw-write`'s explicit `normalize` parameter).
- **The count is per replaced code point** - N counts matched characters, not output characters; N =
  0 and an upstream throw both write no count line and no journal record.
- **One class, one table** - the em/en dash family is this flavor's class; the quotes map never
  touches a dash (and this table never touches a quote) - run the flavors the session's characters
  call for.
- **The replacement is a literal string** - a `$` pattern in `replacement` is never interpreted
  (the function replacer inserts it verbatim).

## The Config

| Field                    | Type    | Default                              | Volatile | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------ | ------- | ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `log`                    | boolean | `true`                               | yes      | write the durable ledger file                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `logFile`                | string  | `~/.dsh/hook-dsh-normalize-dash.log` | yes      | the normalize-dash ledger (separate from the family's logs)                                                                                                                                                                                                                                                                                                                                                                                                         |
| `replacement`            | string  | `-`                                  | yes      | the transform's only knob - hot-editable, the next stream picks it up with no remount                                                                                                                                                                                                                                                                                                                                                                               |
| `normalizeReasoning`     | boolean | `true`                               | no       | normalize reasoning deltas and the assembled reasoning block too                                                                                                                                                                                                                                                                                                                                                                                                    |
| `normalizeToolArguments` | boolean | `false`                              | no       | IMPLEMENTED (default OFF): rewrite the tool-call argumentsDelta and the assembled ToolCallBlock.arguments when on (with three exemptions: `edit`, `raw-write` and `normalize-file` calls pass through by identity (the edit tool's `old_string` must match the real file bytes; the raw-write tool owns its content normalization through its explicit `normalize` parameter; the normalize-file tool's arguments carry a file path - a normalized dash inside a filename would corrupt the target); and a call whose arguments open with the `{"__normalize":false` first-key marker passes through unnormalized, the marker entry stripped) - execution-critical raw JSON, the user's accepted risk; the example patch turns it on |

Volatile cells commit without remounting the plugin (the fiber - and with it the [llm/stream][dsh-llm]
registration - stays alive); the factory's State builder unwraps them defensively.

---

## In Action

One stream, one transformation.

The model emits prose with typographic dashes; the live UI and the
transcript receive the ASCII forms:

```text
text-delta in (what the model wrote):

  "The refactor is complete — every call site updated, ranges 10–15
   covered, and the odd U+2015 bar ― swept too."

text-delta out (what reaches the transcript):

  "The refactor is complete - every call site updated, ranges 10-15
   covered, and the odd U+2015 bar - swept too."
```

The em dash (U+2014), the en dash (U+2013) and the horizontal bar (U+2015) each become `-`; the
ASCII hyphens that were already there are untouched (count only counts replacements).

The same pass
runs over reasoning deltas (`normalizeReasoning`, default on) and - with the example patch enabling
`normalizeToolArguments` - over tool-call arguments, where the three-way gate keeps the sensitive
calls intact:

```text
tool-call-delta, name "edit"        → passes through BY IDENTITY
                                      (old_string must match real file bytes,
                                       em dashes and all)
tool-call-delta, name "raw-write"   → passes through BY IDENTITY
                                      (the tool owns its normalization
                                       through its explicit `normalize`
                                       parameter)
tool-call-delta, name "write",
  arguments `{"file": "a — b.txt"}` → normalized to `{"file": "a - b.txt"}`
```

And the `raw-write` tool in the file-writing direction: its content lands verbatim by default, or
runs the family's six-fold chain when called with `normalize: true` - the em dash above would
survive the default call and become a hyphen under `normalize: true`.

When a stream finishes
normally with replacements made, the ledger gets the count line:

```text
hook-dsh-normalize-dash: normalized 4 dash char(s) in one stream
```

The selection can also be FINE-GRAINED - the same call that wrote the prose above, done with the
raw-write tool per call.

The literal characters in these examples are written with the RAW-WRITE
tool itself (this is exactly the stream-exempt path the tool exists for):

raw-write, content
`"The refactor is complete — every call site updated, ranges 10–15 covered, and the odd U+2015 bar ― swept too."`,
normalize absent:

→ the file matches the input byte-for-byte (em dash, en dash and the horizontal bar all survive)

raw-write, same content, normalize: ["dash"]:

→
`The refactor is complete - every call site updated, ranges 10-15      covered, and the odd U+2015 bar - swept too.`
(ONLY the dash-family characters are replaced; a curly quote, an ellipsis or a full-width character
in the same content would survive untouched)

raw-write, content `"He said “wait” … then left．"`, normalize: ["quotes"]:

→ `He said "wait" … then left．` (ONLY the curly quotes are replaced — the ellipsis and the
full-width period are untouched by the quotes-only selection)

raw-write, content `"He said “wait” … then left．"`, normalize: true:

→ `He said "wait" ... then left.` (all six transforms, in the family's fixed order — the legacy
behavior)

The order is FIXED by the family (dashes → quotes → ellipsis → spaces → invisible → fullwidth) even
when the selection lists the flavors out of order: `normalize: ["fullwidth", "dash"]` still applies
dashes first.

And the governance direction, per call: a raw-write to a `package.json` with `govern: true` runs the
registered chain pass (canonicalize) and the update stage through the factory's direct-govern
registry after the write lands; `govern: ["pin"]` runs only the pinner's chain pass;
`govern: ["update"]` runs only the update stage.

The default — `govern` absent — writes the file and
lets the [fs/observed][dsh-fs] event path govern it exactly as before:

```text
raw-write  package.json, govern: ["canonicalize"]
  → the write completes verbatim (or normalized, per `normalize`)
  → then the governor's chain pass runs: canonicalizes the chain-governed
    pins (ledger: `governed <path> → <version>`) — best-effort, contained,
    never affecting the write's outcome

raw-write  Cargo.toml, govern: ["cargo", "update"]
  → then the cargo module's chain + normalization pass and its update stage
    run, in the registered order
```

---

## The Ledger

Two lines, both written through the factory's `Append` (the hook-dsh-normalize-dash: prefix is the
logger's `<State.Module>:`; the durable file line is `[<ISO>] <message>`):

```text
hook-dsh-normalize-dash: activated (replacement=-, reasoning=on, toolArgs=off, logFile=~/.dsh/hook-dsh-normalize-dash.log)
hook-dsh-normalize-dash: normalized N dash char(s) in one stream
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

- **The default is the CLASSIC build.** `import ... from "@playform/hook-dsh-normalize-dash"` resolves to
  `Target/` with zero framework dependencies.
- **The whole-family toggle to the EFFECT-TS build** - one flag, applied to every
  `@playform/hook-dsh-*` package at once (the family stays coherent - never mix variants in one
  graph):
  - Node: `node --conditions=effect-ts` (or `NODE_OPTIONS="--conditions=effect-ts"`).
  - TypeScript: `"customConditions": ["effect-ts"]` in `compilerOptions` (TS 5.0+).
  - esbuild: `conditions: ["effect-ts"]`; Vite: `resolve.conditions: ["effect-ts"]`; webpack:
    `resolve.conditionNames: ["effect-ts"]`.
- **The per-import escape hatch** (no loader config at all): `import ... from
  "@playform/hook-dsh-normalize-dash/effect-ts"` (or `/classic`) - deterministic in every toolchain.

`effect` v4.0.2 ships as a dependency so the EFFECT-TS build resolves with the same single install
(the CLASSIC build never imports it).

## License 📜

CC0-1.0.

[dsh-llm]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts
[dsh-fs]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts
