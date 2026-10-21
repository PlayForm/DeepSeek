# @playform/hook-dsh-normalize-spaces

*The DeepSeek Harness Plugin Family for PlayForm.*

[![npm](https://img.shields.io/static/v1?label=npm&message=%40playform%2Fhook-dsh-normalize-spaces&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-normalize-spaces)
[![release](https://img.shields.io/static/v1?label=release&message=v0.1.0&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-normalize-spaces)
[![variant](https://img.shields.io/static/v1?label=variant&message=CLASSIC&color=blue)](../../README.md)
[![sibling](https://img.shields.io/static/v1?label=sibling&message=EFFECT-TS&color=white)](../../README.md)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

> [!NOTE]
>
> The **space normalizer for model output** - a DeepSeek Harness plugin that hooks the [`llm/stream`][dsh-llm]
> waterfall (the interceptable wrapper around EVERY streaming model call, bound to the [LlmRuntime][dsh-llm])
> and normalizes the unicode space family in model output, live in the transcript: every visible
> non-terminator space that is not the ASCII space becomes the plain ASCII space - U+00A0 to `' '`,
> quads and quirs alike.
>
> *A CLASS flavor of the normalize family: the core's `Spaces` class plus a configurable
> `replacement` string (default `" "`, the plain ASCII space).*
>
> *The @-sentence identity: **Hook @ DSH
> @ Normalize @ Spaces**.*
>
> *The family's `raw-write` tool (registered by
> [`hook-dsh-normalize-dash`](../hook-dsh-normalize-dash)) bypasses this flavor's transforms too -
> the exemption is family-wide: the core's `Stream/Chunk` + `Stream/Block` pass every `raw-write`
> call through by identity, so the tool's explicit `normalize` parameter (default false = verbatim)
> is the only normalization it applies.*

---

## Where It Fits

**Family position** (the @-sentence **Hook @ DSH @ Normalize @ Spaces**): a hook child of the
[`plugin-dsh-factory`](../plugin-dsh-factory) service and the [`lib-dsh-core`](../lib-dsh-core)
machinery; the fourth of the six stream normalizer siblings.

One of **six siblings** in the stream-normalization family, all built on the shared machinery -
[`plugin-dsh-factory`](../plugin-dsh-factory) for `State`/`Append` (and the named `Schema` helper,
`shared: false`, for the config), [`lib-dsh-core`](../lib-dsh-core) for the `Spaces` class and the
generic `Replace`/`Chunk`/`Block` dispatch:

| flavor                                                            | table                  | substitution                  |
| ----------------------------------------------------------------- | ---------------------- | ----------------------------- |
| [`hook-dsh-normalize-dash`](../hook-dsh-normalize-dash)           | core `Dashes` class    | `→ replacement` (default `-`) |
| [`hook-dsh-normalize-quotes`](../hook-dsh-normalize-quotes)       | core `Quotes` MAP      | curly → straight              |
| [`hook-dsh-normalize-ellipsis`](../hook-dsh-normalize-ellipsis)   | core `Ellipsis` class  | U+2026 → `...`                |
| [hook-dsh-normalize-spaces](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-spaces/Source) (this bundle)                         | core `Spaces` class    | unicode spaces → `" "`        |
| [`hook-dsh-normalize-invisible`](../hook-dsh-normalize-invisible) | core `Invisible` class | removed (default `""`)        |
| [`hook-dsh-normalize-fullwidth`](../hook-dsh-normalize-fullwidth) | core `Fullwidth` MAP   | full-width → half-width       |

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
pnpm add @playform/hook-dsh-normalize-spaces
```

1. **Remote / dependency install (auto-activation):** `pnpm add @playform/hook-dsh-normalize-spaces`
   in a profile dir (+ the package name in `dsh.profile.bundles`, or `dsh plugin add`) - installed
   automatically and activated at the next host start.
2. **Local git clone:** clone → `pnpm install` inside the bundle (its `pnpm-workspace.yaml` pins
   `packages: [.]` so the install lands in the bundle, not the workspace root) → build →
   `dsh plugin --profile <name> add <this directory>`.
3. **Tarball / npm**: `dsh plugin --profile <name> add <tarball-or-spec>` - the package ships built
   `Target/` (minified, `.d.ts` twins), so no build runs at install time.

Verify with the `hook-dsh-normalize-spaces: activated (...)` ledger line.

### Usage

The bundle is configured through its [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-spaces/cordis.patch.yml) row (or the profile's `dsh.bundle`
manifest) - the full config table is in [The Config](#the-config):

```yaml
- insert:
      - id: hook-dsh-normalize-spaces
        name: "@playform/hook-dsh-normalize-spaces"
        config:
            log: true
            logFile: ~/.dsh/hook-dsh-normalize-spaces.log
            replacement: " "
```

---

## The Problem

Model output picks up exotic spaces - the no-break space from copy-pasted prose, the thin space from
typographic text, the ideographic space from CJK input.

Markdown renderers and shell quoting do not
treat them as spaces; a command with a U+00A0 in it fails for no visible reason.

This flavor makes
the plain ASCII space the one that reaches the transcript.

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
       ├─ text-delta ────────► Replace(text, Spaces, " ")   rewrite the text field
       ├─ reasoning-delta ───► same, when normalizeReasoning (default ON)
       ├─ block-end ─────────► the assembled block's text fields -
       │                       TextBlock.text / ReasoningBlock.text (plus a
       │                       runtime `thinking` string field) - the deltas
       │                       AND the block must agree, or consumers see
       │                       inconsistencies
       ├─ tool-call-delta ───► Replace(argumentsDelta, Spaces, " ") when
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
  Factory.Append ──► `hook-dsh-normalize-spaces: normalized N space char(s) in one stream`
```

### The transform

Exactly the core's `Spaces` class ([@playform/lib-dsh-core](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/lib-dsh-core/Source)'s `Normalize/Spaces`), applied per text
segment through the core's generic class-to-string `Replace`:

```text
[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]  →  replacement
```

U+00A0 (no-break space), U+1680 (ogham space mark), U+2000 through U+200A (en quad, em quad, en
space, three-per-em, four-per-em, six-per-em, figure space, punctuation space, thin space, hair
space), U+202F (narrow no-break space), U+205F (medium mathematical space) and U+3000 (ideographic
space) - exactly Unicode's Zs category minus the ASCII space - become the config `replacement`
(default `" "`, the plain ASCII space U+0020).

- **No context rules** - whole-chunk replacement, no lookahead; chunk-boundary-safe.
- The replacement is applied with a **function replacer**, so a custom `replacement` containing `$`
  patterns is inserted literally.
- Replaced characters are **counted per stream** for the ledger line.

---

## The Pitfalls

- **Zs minus ASCII** - the class is the unicode space family (U+00A0, U+1680, U+2000-U+200A, U+202F,
  U+205F, U+3000); tabs and newlines are not spaces and never match.
- **A dependency alone is NOT activation** - the package must be in `dsh.profile.bundles` (or the
  patch row inserted), or no listener registers and no ledger exists.
- **The stream gate rewrites model output only** - it never touches disk; files already on disk are
  the `normalize-file` tool's job.
- **The count is per replaced code point** - N counts matched characters; N = 0 and an upstream
  throw both write no count line and no journal record.

## The Config

| Field                    | Type    | Default                                | Volatile | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------ | ------- | -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `log`                    | boolean | `true`                                 | yes      | write the durable ledger file                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `logFile`                | string  | `~/.dsh/hook-dsh-normalize-spaces.log` | yes      | the spaces ledger (separate from the family's logs)                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `replacement`            | string  | `" "`                                  | yes      | the transform's only knob - hot-editable, the next stream picks it up with no remount                                                                                                                                                                                                                                                                                                                                                                               |
| `normalizeReasoning`     | boolean | `true`                                 | no       | normalize reasoning deltas and the assembled reasoning block too                                                                                                                                                                                                                                                                                                                                                                                                    |
| `normalizeToolArguments` | boolean | `false`                                | no       | IMPLEMENTED (default OFF): rewrite the tool-call argumentsDelta and the assembled ToolCallBlock.arguments when on (with three exemptions: `edit`, `raw-write` and `normalize-file` calls pass through by identity (the edit tool's `old_string` must match the real file bytes; the raw-write tool owns its content normalization through its explicit `normalize` parameter; the normalize-file tool's arguments carry a file path - a normalized dash inside a filename would corrupt the target); and a call whose arguments open with the `{"__normalize":false` first-key marker passes through unnormalized, the marker entry stripped) - execution-critical raw JSON, the user's accepted risk; the example patch turns it on |

Volatile cells commit without remounting the plugin; the factory's State builder unwraps them
defensively.

## The Granular Scopes (all volatile)

The `scopes` object gates every arm of the hook-dsh-normalize-spaces hook independently — the defaults are exactly the
pre-scopes behavior, and because the schema shape is identical in every family hook, one grouped
override in the profile patch turns the whole family off in one edit (see the patch fragment at the
end of this section). The whole object carries the volatile marker (its leaves stay plain —
schemastery rejects volatile leaves under an enclosing volatile field): one leaf change commits one
`loader/volatile-update` dispatch whose whole object the State's refresh listener re-reads — live,
silent, no remount, no new activation line.

| Scope        | Default | Gates                                                                 |
| ------------ | ------- | --------------------------------------------------------------------- |
| conversation | on      | text-delta text + the assembled text/reasoning blocks                 |
| reasoning    | on      | the reasoning-delta sub-gate (ANDed with `normalizeReasoning`)         |
| toolInput    | off     | the tool-call arguments arm (OR-ed with `normalizeToolArguments`)     |
| toolResults  | off     | the tools/post-execute arm (tool results in the transcript)           |
| files        | on      | inert in a stream flavor (present so one patch override drives the whole family)                                                            |
| batch        | off     | the agent/pre-step arm (the incoming step batch)                      |

`normalizeToolArguments` is kept and OR-ed in (effective toolInput = the field ||
`scopes.toolInput`), so every existing profile keeps working.

The per-call `{"__normalize":false` first-key marker is the tool-args arm's escape hatch — the
"leave that search alone" control: a deliberate search for an irregular character (an em dash, a
curly quote, a full-width form as a PATTERN) survives byte-exact while the rest of the call stream
normalizes. Documented edges: the marker must be the FIRST key, and a pathologically tiny first
delta (shorter than the marker) is invisible to the startsWith probe — the call normalizes
normally.

`toolResultsExempt` (volatile): a tool result whose exec name is listed passes the tool-results arm
by identity — `read`, `edit`, `raw-write`, `normalize-file`, `ccr_retrieve`, `subagent`,
`ask_user_question` by default.

## The Overpass Arms

Two additional listeners, both registered at apply and both opt-in (gated at RUNTIME on the scope
cells, so flipping a scope lands through the P10 volatile-refresh without any re-registration):

- **Tool results** — `tools/post-execute`, `{ prepend: true }` (OUTERMOST vs the ccr hook's own
  prepended gate: the ccr compression sees the NORMALIZED bytes; the `<<<CCR:` marker guard makes
  any load order safe). Accepted, non-value-carrying decisions only; TEXT blocks only (never
  tool-call/argument blocks); N = 0 is a true no-op — no ledger line; fail-open. The invisibility
  contract: the replacement is PRE-COMMIT — the waterfall settles before the result is appended to
  the durable log — so the model only ever sees the normalized output and never notices the
  replacement (the write-path counterpart is the governance trio's never-notify precedent: the tool
  result is built from the author's own content, and the observation-policy's version record is
  refreshed by the re-emitted fs/observed).
- **Step batch** — `agent/pre-step`, default order. While `scopes.batch` is on every incoming batch
  is normalized; the command's one-shot arm fires ONCE regardless of the scope value and is cleared
  after one use. Text blocks only; never the assistant/tool history.

The space overpass lines (N > 0 only):

```text
hook-dsh-normalize-spaces: overpass: normalized N char(s) in tool result <toolName> <callId>
hook-dsh-normalize-spaces: overpass: normalized N char(s) in step batch (turn T step S)
hook-dsh-normalize-spaces: overpass: swept K file(s), normalized M char(s)
```

## The normalize-overpass Command

Registered through the `commands` service when it is present (probe-once — a missing service simply
skips the registration). Grammar:

| Input              | Effect                                                                            |
| ------------------ | --------------------------------------------------------------------------------- |
| `files <path…>`    | declined — the sweep is owned by the normalize-file hook                                                                       |
| `batch`            | arm the one-shot step-batch overpass (consumed by the next incoming batch)        |
| `results on\|off` | flip `scopes.toolResults` via the settings service / config editor — never direct State mutation; absent services → reports the settings-UI path |
| `scopes`           | read-only report of the current effective values (the activation line never changes) |

## The Patch-Level Global Off

```yaml
- id: hook-dsh-normalize-spaces
  config:
    scopes:
      conversation: false
      reasoning: false
      toolInput: false
      toolResults: false
      files: false
      batch: false
```

---


## In Action

One stream, one transformation.

The model emits copy-pasted typographic spacing; the live UI and the
transcript receive plain ASCII spaces.

In the incoming line below the three gaps are the no-break
space U+00A0, the em quad U+2003 and the ideographic space U+3000, in that order:

```text
text-delta in (what the model wrote; each marked gap is a non-ASCII space):

  deploy the agent to the ring　buffer

text-delta out (what reaches the transcript):

  "deploy the agent to the ring buffer"
```

Each non-ASCII space in the Zs-minus-ASCII class - U+00A0 between `deploy` and `the`, U+2003 between
`agent` and `to`, U+3000 between `ring` and `buffer` in the sample above - becomes exactly one ASCII
space (U+0020); ASCII spaces that were already there are untouched.

This is what makes a pasted
command executable again: `echo a b` with the no-break space U+00A0 between the arguments runs after
the pass, where before the pass the shell saw one mangled word.

When a stream finishes normally with
replacements made, the ledger gets the count line (note the `replacement= ` field renders the
default as a bare space):

```text
hook-dsh-normalize-spaces: normalized 3 space char(s) in one stream
```

The `replacement` is hot-editable (say to `_` for debugging), and the same pass runs over reasoning
deltas when `normalizeReasoning` is on and over tool-call arguments when the example patch enables
`normalizeToolArguments` - with the `edit`, `raw-write` and `normalize-file` names exempt and raw-marker calls passing through
unnormalized.

---

## The Ledger

Two lines, both written through the factory's `Append` (the hook-dsh-normalize-spaces: prefix is
the logger's `<State.Module>:`; the durable file line is `[<ISO>] <message>`):

```text
hook-dsh-normalize-spaces: activated (replacement= , reasoning=on, toolArgs=off, logFile=~/.dsh/hook-dsh-normalize-spaces.log)
hook-dsh-normalize-spaces: normalized N space char(s) in one stream
```

(In the activation line, `replacement= ` is followed by the ASCII space itself - the default renders
as a trailing blank.)

The activation line is written by `apply()`; the count line only follows a normal stream completion
and only when N > 0 (a thrown-away stream writes no ledger line).

Every N > 0 pass also journals one `normalized` record into the shared `package_governance` v2
domain - event `normalized`, path = the empty stream-level path, detail byte-identical to the
count line - best-effort: with no storage facility the record buffers or drops, and the human
ledger stays the complete record.

---

## The two release groups (CLASSIC vs EFFECT-TS)

Two published groups, one contract: this package is the CLASSIC build - plain TypeScript,
zero framework dependencies: `import ... from "@playform/hook-dsh-normalize-spaces"` resolves to `Target/`.
The EFFECT-TS implementation of the same contract is the separate package `@playform/ets-hook-dsh-normalize-spaces` -
effect-backed, built on the shared `@playform/ets-base-dsh` base with `effect` v4.0.2 as
its runtime dependency. Install the group you run and never mix the groups in one graph
(the effect-ts `Update` returns Effect envelopes, not the classic dispatch envelope).

## License 📜

CC0-1.0.

[dsh-llm]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts
[dsh-fs]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts
