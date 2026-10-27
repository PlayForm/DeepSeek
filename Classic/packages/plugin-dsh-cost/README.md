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
- **Amortized** (the input side): the context that made the decision possible, weighted by each
  file's token mass in the surface - a file read early carries its mass into every later step.

## The schema

| Table                                                 | One row per                                                      |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| `Price`                                               | effective-dated provider/model rate (append-only, never updated) |
| `Client`, `Project`, `Session`, `File`, `FileVersion` | payer, workspace, conversation, path, version                    |
| `Call`, `Touch`, `ContextMass`                        | one request; one file interaction; one file's surface mass       |
| `Allocation`, `Rollup`                                | one call's money for one file; the materialized day aggregate    |
| `Annotation`, `Cursor`                                | the written comment; the drain progress (idempotent drains)      |

The views `FileCost`, `ModelCost`, `SessionCost`, `ClientCost` pre-aggregate the money.

## The commands

The three human commands run through the `commands` service - none of them is a tool and none enters
the model context. One registered command owns the grammar and the verb is its first word:

| Invocation                                  | What it does                                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `/cost report [scope] [range]`              | the rollup for `file`, `project`, `client`, `model` or `session`; `range` is one UTC day    |
| `/cost export <csv\|json\|markdown> [path]` | the client-facing bundle: RFC 4180 CSV, the re-derivable JSON, or the markdown invoice      |
| `/cost annotate [path]`                     | write the cost comment into the named files, or every file the ledger knows for the project |

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
`csv`; `prices` the three shipped rows per million tokens.
