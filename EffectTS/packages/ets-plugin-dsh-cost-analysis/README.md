# plugin-dsh-cost-analysis

The read-only analysis half of the cost family. The @playform/ets-plugin-dsh-cost plugin writes the
ledger; this package opens the same SQLite file with `{ readOnly: true }` and answers questions
about contribution and efficiency. It never writes a row, never creates a table, and never registers
a tool or a prompt section: the ledger keeps recording facts, and the judgements live here, where an
analysis pass may be expensive, occasional, and wrong in interesting ways
(Documentation/Plans/COST-TRACK-PLUGIN.md sections 11-13 and 16).

## The metric catalogue

| Metric        | Query and formula                                                                                                                                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| credit        | Read credit (Ring C, section 11): over every call whose surface carried the file after one of its read touches, `cacheReadTokens * (inputRate - cacheReadRate) / 1e6`, summed, minus any cache-write premium - a negative cost credited to the file that was read. |
| effectiveness | Cost per surviving line over `Verdict.State = 'changed'`: `sum(direct + amortized) / sum(surviving lines)`, read-before-edit files against the rest.                                                                                                               |
| lines         | Lines added and removed per hunk from `Edit` (section 17.3), so a 40-line refactor is visible next to a one-line fix.                                                                                                                                              |
| overhead      | The `FileId IS NULL` allocation share: the money a call spent that no file paid for (retries, compaction, the shared context).                                                                                                                                     |
| cache         | Cached mass over total mass per file: the share of the file's surface tokens the prompt cache served (`ContextMass` against the per-call cache-read share).                                                                                                        |

## The command

`/cost analysis [scope]` - renders the enabled metric families for the scope (`file`, `project`,
`client`, `model`, or `session`) as short text, and says "the ledger is empty" when a scope has no
rows. When the ledger file does not exist the command says so and the plugin still loads.

## Config

| Field        | Default                    | Meaning                                  |
| ------------ | -------------------------- | ---------------------------------------- |
| enabled      | `true`                     | Master switch.                           |
| databasePath | `~/.dsh/cost/ledger.db`    | The ledger file, opened read-only.       |
| client       | `""`                       | Client filter; empty means every client. |
| window       | `30`                       | The day window the readings cover.       |
| metrics      | all five `true`            | Which metric families render.            |
| log          | `true`                     | Write the diagnostic log.                |
| logFile      | `~/.dsh/cost/analysis.log` | Where the diagnostic log goes.           |
