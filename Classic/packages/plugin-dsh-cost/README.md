# @playform/plugin-dsh-cost

> v0.3.0 - UNPUBLISHED - plan: [COST-TRACK-PLUGIN](../../Documentation/Plans/COST-TRACK-PLUGIN.md)

## What it measures

The per-file inference cost ledger: a **telemetry-only reader** of the session log. Every model call
is priced from the provider's own `usage`, split across the files the conversation touched, and
stored in one SQLite ledger. It never adds a tool, a prompt section, or a model-visible message.

## The two attribution halves

- **Direct** (the output side): the model's decision to act, weighted by each written file's share
  of changed bytes; equal shares when nothing was written, the unattributed bucket when nothing was
  touched.
- **Amortized** (the input side): the context that made the decision possible, split per cache
  bucket - the uncached input weighted by each file's uncached mass, the cached input by its cached
  mass, because prompt caching is prefix-based and one blended ratio misprices a file whose tokens
  are cached against one whose are not. A file read early carries its mass into every later step.

## The schema

| Table                                                 | One row per                                                      |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| `Price`                                               | effective-dated provider/model rate (append-only, never updated) |
| `Client`, `Project`, `Session`, `File`, `FileVersion` | payer, workspace, conversation, path, version                    |
| `Call`, `Touch`, `ContextMass`                        | one request; one file interaction; one file's surface mass       |
| `Allocation`, `Rollup`                                | one call's money for one file; the materialized day aggregate    |
| `Annotation`, `Cursor`                                | the written comment; the drain progress (idempotent drains)      |
| `Alias`                                               | one observed rename, so a file's cost survives its path change   |
| `Verdict`                                             | one session's outcome for one file: changed, reverted, or read   |

The views `FileCost`, `ModelCost`, `SessionCost`, `ClientCost` and `FileLifetime` pre-aggregate the
money - the last one answers "what has this file cost across every session that ever touched it".

The v2 analytics columns (schema migration, additive, `PRAGMA user_version` 1 to 2):

| Column           | On      | What it stores                                                              |
| ---------------- | ------- | --------------------------------------------------------------------------- |
| `Window`         | `Price` | the pricing window label (`any`, `peak`, `offpeak`) the row is in force for |
| `CacheSaving`    | `Call`  | the reads the cache made cheaper, minus any cache-write premium             |
| `Stage`          | `Touch` | the semantic pipeline stage the touch moved the file through                |
| `Branch`         | `Touch` | the branch at the touch, so a file's cost splits per branch                 |
| `ReadBeforeEdit` | `Touch` | whether the file was read earlier in the session than this write-kind touch |

The v3 factor columns and tables (schema migration, additive, `PRAGMA user_version` 2 to 3):

| Column or table        | On              | What it stores                                                                        |
| ---------------------- | --------------- | ------------------------------------------------------------------------------------- |
| `TierFrom`, `TierTo`   | `Price`         | the bounds of one tier of a marginal rate card; a NULL `TierTo` is the open top tier  |
| `Mode`, `Region`       | `Price`, `Call` | the pricing mode and residency region; a NULL means "any"                             |
| `Tier`                 | `Call`          | the tier floor of the rate card that priced the call                                  |
| `Modifier`             | table           | one effective-dated multiplier for one pricing mode, optionally scoped to one model   |
| `Factor`, `CallFactor` | tables          | one classification dimension value and its weight on one call - a classifier is a row |

The v4 edit and telemetry grain (schema migration, additive, `PRAGMA user_version` 3 to 4):

| Column or table                                | On      | What it stores                                                                                      |
| ---------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `Edit`                                         | table   | one hunk a write or edit tool call produced, unique per (touch, ordinal), with lines, bytes, hashes |
| `LatencyMs`, `FirstTokenMs`, `TokensPerSecond` | `Call`  | the step-to-message latency, the first stream token, the output tokens per second                   |
| `Attempts`, `ErrorCode`                        | `Call`  | the assistant/attempt count between the step and the message; the first failure code                |
| `ContextWindow`, `Utilization`                 | `Call`  | the request's context window and the surface tokens' share of it                                    |
| `DurationMs`, `ResultBytes`                    | `Touch` | the tool's duration and the rendered result bytes (reserved; not written by the drain yet)          |

## The stages

`Touch.Stage` is recorded at capture time from the tool kind and the file's own prior touches in the
session - not inferred at report time:

| Stage      | Detected from                                   | What it means                       |
| ---------- | ----------------------------------------------- | ----------------------------------- |
| `discover` | `glob`, `grep`, a search result naming the file | the file was located, not read      |
| `read`     | a first `read`                                  | the content entered the context     |
| `reread`   | a second `read` before any edit                 | the model went back to check itself |
| `edit`     | `write`, `edit`, `delete`, `move`               | the content changed                 |
| `verify`   | a `read` after the last `edit` of that file     | the change was checked              |
| `revert`   | an `edit` whose result restores an earlier hash | the change was undone               |

## The commands

The five human commands run through the `commands` service - none of them is a tool and none enters
the model context. One registered command owns the grammar and the verb is its first word:

| Invocation                                  | What it does                                                                                                                                                         |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/cost report [scope] [range]`              | the rollup for `file`, `project`, `client`, `model` or `session`; `range` is one UTC day                                                                             |
| `/cost export <csv\|json\|markdown> [path]` | the client-facing bundle: RFC 4180 CSV, the re-derivable JSON, or the markdown invoice                                                                               |
| `/cost annotate [path]`                     | write the cost comment into the named files, or every file the ledger knows for the project                                                                          |
| `/cost assess [session]`                    | one session's spend bucketed as `delivered`, `explored`, `reverted`, `overhead` and `carry`, plus the derived cost per surviving line and the edit-grain line totals |
| `/cost forecast [days]`                     | the daily rate per scope and key over the last `days` (thirty by default), projected to a thirty-day period with its confidence band                                 |

The assessment buckets are descriptive and always stored as rows the ledger can re-derive (`Verdict`
per session and file, the unattributed allocation rows for overhead); the discount policies stay an
export-time concern and are not applied to the stored truth.

The annotation is a marker-delimited block that speaks the file's own comment language; writing it
twice is a no-op, and a hand edit afterwards only replaces the block:

```text
// dsh-cost:begin
// Inference cost: 12.4183 USD (direct 3.1022 + amortized 9.3161)
// Models: deepseek-v4.1-flash-1017 9.8821 | glm-5.3-flash 2.5362
// Calls: 41 | First: 2026-10-21 | Last: 2026-10-27
// dsh-cost:end
```

It ships off by default (`annotate.enabled: false`) - the one toggle the user asked for - and the
write goes through the factory's write executor, so a file that changed under the plugin refuses the
annotation and retries, never forces it.

## The configuration

`enabled` and `log` on; the ledger at `~/.dsh/cost/ledger.db`, the log at `~/.dsh/cost/cost.log`;
`currency` `USD`, `client` `default`; `capture` sessions and subagents on, backfill off;
`attribution` direct `bytes` / amortized `context`; `annotate` off (marker `dsh-cost`); `export`
`csv`; `prices` the three shipped rows per million tokens; `modifiers` the four shipped mode
multipliers (batch 0.5, flex 0.5, priority 2.0, ultrafast 6.0, all from 2026-01-01); `priceWindows`
empty.
