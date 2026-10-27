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

- `/cost report [scope] [range]`, `/cost export <csv|json> [path]`, `/cost annotate [path]`.

## The configuration

`enabled` and `log` on; the ledger at `~/.dsh/cost/ledger.db`, the log at `~/.dsh/cost/cost.log`;
`currency` `USD`, `client` `default`; `capture` sessions and subagents on, backfill off;
`attribution` direct `bytes` / amortized `context`; `annotate` off (marker `dsh-cost`); `export`
`csv`; `prices` the three shipped rows per million tokens.
