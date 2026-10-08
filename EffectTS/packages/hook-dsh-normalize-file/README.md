# @playform/hook-dsh-normalize-file

_The DeepSeek Harness Plugin Family for PlayForm._

[![npm](https://img.shields.io/static/v1?label=npm&message=%40playform%2Fhook-dsh-normalize-file&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-normalize-file)
[![release](https://img.shields.io/static/v1?label=release&message=v0.0.1&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-normalize-file)
[![variant](https://img.shields.io/static/v1?label=variant&message=EFFECT-TS&color=blue)](../../README.md)
[![sibling](https://img.shields.io/static/v1?label=sibling&message=CLASSIC&color=white)](../../README.md)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

> [!NOTE]
>
> The **file-content normalizer** - a DeepSeek Harness plugin that registers the normalize family's
> `normalize-file` TOOL: the read → count → write pipeline over files ALREADY on disk, beyond the
> tool layer.
>
> One agent-chosen file per call: the target's content is read, the family's SIX
> transforms are applied with a per-character count, and only when N > 0 is the rewritten content
> written back through the factory's ONE shared write executor.
>
> N = 0 writes NOTHING - the no-op
> no-write rule.
>
> _The family's first LISTENER-LESS flavor: no
> [`llm/stream`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts),
> no
> [`fs/observed`][dsh-fs] -
> nothing runs without an explicit agent action._
>
> _The background-rewrite posture is deliberately NOT
> shipped (it would break the edit tool's `old_string` contract); the design report ships the tool
> arm only._
>
> _The @-sentence identity: **Hook @ DSH @ Normalize @ File**._
>
> _This bundle's own tool calls are name-exempt in [the stream gate](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/hook-dsh-core/Source/Stream) beside `edit` and `raw-write` -
> its arguments carry a FILE PATH, and a normalized dash inside a filename would corrupt the
> target._

---

## Where It Fits

**Family position** (the @-sentence **Hook @ DSH @ Normalize @ File**): a tool-child of the
[`plugin-dsh-factory`](../plugin-dsh-factory) service and the [`hook-dsh-core`](../hook-dsh-core)
machinery; the seventh sibling - the one flavor that works on files already on disk instead of model
output.

One of **seven siblings** in the normalize family, all built on the shared machinery -
[`plugin-dsh-factory`](../plugin-dsh-factory) for `State`/`Append`/`Journal`/`Write` (and the named
`Schema` helper, `shared: false`, for the config), [`hook-dsh-core`](../hook-dsh-core) for the six
transform tables and the generic `Replace`/`ReplaceMap` replacers:

| flavor                                                            | layer                            | mechanism                                          |
| ----------------------------------------------------------------- | -------------------------------- | -------------------------------------------------- |
| [`hook-dsh-normalize-dash`](../hook-dsh-normalize-dash)           | model output (stream)            | core `Dashes` class -> `replacement` (default `-`) |
| [`hook-dsh-normalize-quotes`](../hook-dsh-normalize-quotes)       | model output (stream)            | core `Quotes` MAP -> curly -> straight             |
| [`hook-dsh-normalize-ellipsis`](../hook-dsh-normalize-ellipsis)   | model output (stream)            | core `Ellipsis` class -> `...`                     |
| [`hook-dsh-normalize-spaces`](../hook-dsh-normalize-spaces)       | model output (stream)            | core `Spaces` class -> `" "`                       |
| [`hook-dsh-normalize-invisible`](../hook-dsh-normalize-invisible) | model output (stream)            | core `Invisible` class -> removed                  |
| [`hook-dsh-normalize-fullwidth`](../hook-dsh-normalize-fullwidth) | model output (stream)            | core `Fullwidth` MAP -> full-width -> half-width   |
| [hook-dsh-normalize-file](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/hook-dsh-normalize-file/Source) (this bundle)                           | **files already on disk (tool)** | all SIX, at write time, through [Factory.Write][ours-write]    |

The six stream flavors cover only what the model is emitting right now; the raw-write tool's
`normalize: true` covers only content being written.

This flavor covers the gap in between:
pre-existing files, git-cloned material, script-created files - anything already on disk that the
agent did not just write.

The hermes heritage is direct: the `normalize-dashes-for-execute-code.sh`
hook swept script-created files after the fact; DSH makes the same rewrite an explicit, visible,
opt-in TOOL call instead of a background hook (and `normalize-tabs.sh` - the repair hook for a
repair hook - is the cautionary tale that keeps it that way).

A **non-manifest factory consumer**: it injects `["pluginFactory", "fs", "tools"]` and uses `State`
(cell unwrap + shared `Ledger`/`Enabled` mappings + its own field), `Append` (the ledger), `Journal`
(the P5 storage record) and - uniquely in the family - `Write`, the ONE shared write executor.

The
config is composed by the factory's standalone `Schema` helper with `shared: false` - the minimal
block plus the two knobs.

The tool's writes carry the call's exec as the actor, so the governance
trio's Gate (which pins `mutationTools` to `write`/`edit`/`str_replace_editor`) never treats them as
a trigger - the same protection raw-write already has.

## Install

**`Terminal`** (registry)

```sh
pnpm add @playform/hook-dsh-normalize-file
```

1. **Remote / dependency install (auto-activation):** `pnpm add @playform/hook-dsh-normalize-file`
   in a profile dir (+ the package name in `dsh.profile.bundles`, or `dsh plugin add`) - installed
   automatically and activated at the next host start.
2. **Local git clone:** clone → `pnpm install` inside the bundle (its `pnpm-workspace.yaml` pins
   `packages: [.]` so the install lands in the bundle, not the workspace root) → build →
   `dsh plugin --profile <name> add <this directory>`.
3. **Tarball / npm**: `dsh plugin --profile <name> add <tarball-or-spec>` - the package ships built
   `Target/` (minified, `.d.ts` twins), so no build runs at install time.

Verify with the `hook-dsh-normalize-file: activated (...)` ledger line.

### Usage

The tool is called by the agent like any built-in tool - the bundle is configured through its
[cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/hook-dsh-normalize-file/cordis.patch.yml) row (or the profile's `dsh.bundle` manifest), and the full config table is in
[The Config](#the-config):

```
normalize-file { file_path: "notes/report.md" }
→ result { path, count, changed, before, after }   (the diff card shows
                                                     the before/after in
                                                     the same turn)
```

---

## The Problem

Files that never passed through a write tool are invisible to every normalization layer DSH has:
`raw-write`'s `normalize: true` is an explicit per-call opt-in for NEW writes, and the six stream
flavors only rewrite model output - they never touch disk.

Left unnormalized, a pre-existing file
keeps every typographic dash, curly quote, ellipsis, unicode space, zero-width character and
full-width character it was born with - exactly the characters that break parsers, shells, diffs and
byte-exact edit matches downstream.

But the fix cannot be another silent rewriter.

Files are rewritten behind the agent only at the
price of the edit tool's `old_string` contract: the agent read bytes X, a background rewriter
silently changed them to X', and the next edit fails or half-matches.

Hermes learned this the hard
way - its `normalize-tabs.sh` exists to repair the damage its own after-the-fact rewriting caused.

The tool is the answer: explicit, visible, discoverable, zero background activity.

---

## How It Works

**`The pipeline`**

```text
  agent calls normalize-file { file_path }
       |
       v
  ctx.fs.resolve                     the model-supplied path becomes a
       |                             stable target (caller-side, like raw-write)
       v
  ctx.fs.readText(target, signal)    the shared read path - a missing file,
       |                             a directory, a binary/undecodable target,
       |                             a permission failure or an abort rejects
       |                             here -> error result, NO write
       v
  Rewrite(content, replacement)      the counting six-fold chain, in order:
       |                               1. Dashes    class  -> replacement ("-")
       |                               2. Quotes    MAP    -> curly -> straight
       |                               3. Ellipsis  class  -> "..."
       |                               4. Spaces    class  -> " "
       |                               5. Invisible class  -> "" (removed)
       |                               6. Fullwidth MAP    -> full-width -> half-width
       |                             every step returns { text, count } and the
       |                             counts are summed -> N
       v
  N == 0 ?  -----------------------> NO write at all: the file is left
       |                               byte-identical, no ledger line, no
       |                               journal record; result: changed: false
       | N > 0
       v
  Factory.Write(state, target,       the ONE shared write executor:
       |    rewritten, { signal,       the fs/write-intent waterfall, the
       |    actor: exec,               standing sandbox policy, writeText end
       |    policy: "standing" })     to end, and the fs/observed
       |                             { kind: "present", version } emit ON THE
       |                             ROOT CONTEXT with the call's exec as the
       |                             actor - byte-identical with raw-write
       v
  ledger + journal                   `normalized N char(s) in <path>` via
                                      Factory.Append, and the `normalized`
                                      event of the shared package_governance
                                      v2 domain via Factory.Journal
       |
       v
  result { path, count, changed,     the diff card shows the outcome's
           before, after }           before/after in the same turn
```

The transformation is exactly the raw-write `normalize: true` chain - the core's tables and
replacers, applied whole at write time.

There is no stream dispatch to gate: the tool registers NO
event listener, so the six transforms are applied to the entire file content in one pass, and the
count is the ledger's N and the no-op condition in one.

**The conflict map, honored by construction**

- Governance bounded passes: the write goes through [Factory.Write][ours-write] and emits
  [`fs/observed`][dsh-fs],
  but the governors' Gate requires the actor tool name in their `mutationTools` pin -
  `normalize-file` is never added to any such list, so these writes never trigger a chain pass.
- Edit `old_string` contract: safe because visible - the diff card shows the before/after in the
  same turn, and the tool description says to re-read before editing (the same obligation as after
  any `normalize: true` write).
- raw-write read-before-write: tool calls are serialized and [Factory.Write][ours-write]'s `before` is read at
  write time, so a prior normalize-file in the same turn is already reflected. No race.

---

## The Pitfalls

- **The file's bytes change under you** - re-read before editing: the edit tool's `old_string`
  must match the NEW content; the diff card shows the before/after in the same turn.
- **A no-op is a no-write** - N = 0 leaves the file byte-identical: no write, no ledger line, no
  journal record; a missing, binary or undecodable target errors out the same way.
- **No governor triggers** - the write emits fs/observed with the call's exec as the actor, but
  `normalize-file` is never in a governor's `mutationTools`, so no chain pass runs.
- **Name-exempt in the stream gate** - the tool's arguments carry a file path and pass through the
  stream unnormalized, beside `edit` and `raw-write`.

## The Config

| Field         | Type    | Default                              | Volatile | Meaning                                                     |
| ------------- | ------- | ------------------------------------ | -------- | ----------------------------------------------------------- |
| `log`         | boolean | `true`                               | yes      | write the durable ledger file                               |
| `logFile`     | string  | `~/.dsh/hook-dsh-normalize-file.log` | yes      | the normalize-file ledger (separate from the family's logs) |
| `replacement` | string  | `"-"`                                | yes      | the dash step's replacement (the transform's only knob)     |

There are no stream flags (`normalizeReasoning`, `normalizeToolArguments`) and no fs/observed fields
(`updateCooldownMs`, `mutationTools`, `policyFile`, `exclude`): the minimal `shared: false` block
plus the two knobs is the whole config surface, because the tool registers no listener of any kind.

Volatile cells commit without remounting the plugin; the factory's State builder unwraps them
defensively.

---

## In Action

One call, one file, one count.

The file already on disk carries the family's characters; the tool
rewrites what changed and reports it:

```text
before (what is on disk):

  Nova — “launch” ... Q3 — done

after (what the tool writes back):

  Nova - "launch" ... Q3 - done
```

Every em dash (U+2014) becomes the ASCII hyphen-minus, the curly quotes become straight ones, the
ellipsis becomes three periods; five characters replaced, so N = 5 and the write happens.

The result
carries the outcome and the diff card shows the before/after in the same turn; the ledger gets the
count line:

```text
hook-dsh-normalize-file: normalized 5 char(s) in ~/Projects/notes/report.md
```

A file with nothing to replace is a no-op: `changed: false`, the file stays byte-identical, no
write, no count line, no journal record.

A missing, binary or undecodable target is an error result
with no write.

Because the file's bytes change under you, re-read before editing - the edit tool's
`old_string` must match the new content.

---

## The Ledger

Two lines, both written through the factory's `Append` (the hook-dsh-normalize-file: prefix is the
logger's `<State.Module>:`; the durable file line is `[<ISO>] <message>`):

```text
hook-dsh-normalize-file: activated (replacement=-, logFile=~/.dsh/hook-dsh-normalize-file.log)
hook-dsh-normalize-file: normalized N char(s) in <path>
```

The activation line is written by `apply()`; the count line follows only a successful N > 0 write -
a no-op writes no line, and a failed read or an aborted call writes none either.

Each N > 0 write
also journals one `normalized` record into the shared `package_governance` [v2 domain](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/plugin-dsh-factory/Source/Function/Journal.ts) (event
`normalized`, path = the target's display path, detail byte-identical to the count line),
best-effort: with no storage facility the record buffers or drops and the human ledger stays the
complete record.

---

## License 📜

CC0-1.0.

[dsh-fs]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts
[ours-write]: https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/plugin-dsh-factory/Source/Function/Write.ts
