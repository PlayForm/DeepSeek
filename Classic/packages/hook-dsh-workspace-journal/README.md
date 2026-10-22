# @playform/hook-dsh-workspace-journal

The **workspace-journal hook**: a DeepSeek Harness plugin that is the
workspace's **evidence record** - the undo, the recovery checkpoints, and
the crash recovery. It is the JOURNAL role of the workspace family's
invisible flow:

> ... → the merge commits (through Factory.Write) → **the journal records** →
> the audit lines → the live view presents

(Documentation/Plans/Workspace-Family/JOURNAL.md;
Documentation/Plans/WORKSPACE-FAMILY-V4-1.md sections 3.7-3.8.)

## What it does

- **Per-batch records**: the merge journals a batch *before* its writes
  land - `ctx.workspaceJournal.open(batch, entries)` stores the batch
  record (state `applying`) and the per-file pre-images in the plugin's own
  KV storage domain `workspace_journal`. No journal, no writes: "the
  workspace transaction is the ordered set of those writes plus the
  journal".
- **Revert data**: the per-file pre-images (content + version captured
  before the write) are the entries; `ctx.workspaceJournal.revert(batchId)`
  replays them backward through the factory's version-fenced write
  executor - a fence mismatch is a reported conflict, never a silent
  overwrite; a truncated pre-image is skipped with a ledger line, never
  half-applied.
- **Recovery checkpoints**: the fs/observed listener (registered on the
  ROOT context) counts the writes landing against open batches and
  persists the progress - how far a crash got.
- **Crash recovery**: at boot, every batch still `applying` is marked
  `recovery-required` with its identity. The honest all-or-nothing:
  **recoverable partial states, never an invisible intermediate state**.

Batch lifecycle: `applying → verified | recovery-required | reverted`.

## Service

`ctx.workspaceJournal` (registered from apply):

| Method | Description |
| --- | --- |
| `open(batch, entries)` | Journal the batch before its writes land (throws if storage is down) |
| `seal(batchId, next, reason?)` | Close the batch: `verified` or `recovery-required` |
| `revert(batchId)` | Replay backward; per-file report |
| `recover()` | The boot pass over still-`applying` batches |
| `batch(id)` / `batches()` / `entries(id)` | Reads |
| `statistics()` | `{ batches, entries, applying }` |

## Config

Every knob is a volatile cell (hot edits commit without remounting):

| Field | Default | Description |
| --- | --- | --- |
| `enabled` | `false` | Master switch (the IDLE-forever posture) |
| `log` | `true` | Ledger enabled |
| `logFile` | `~/.dsh/workspace-journal.log` | The plugin's own ledger |
| `domain` | `workspace_journal` | The KV domain name |
| `maxBatches` | `200` | The batch ring bound |
| `maxEntryBytes` | `65536` | The pre-image size cap |
| `exclude` | `["node_modules/**", "**/Target/**", "**/.git/**"]` | Excluded paths |

The plugin ships **disabled** - it never appears in the profile's bundles
and enables only by an explicit ACTIVATE.

## Exemptions (documented)

- The ledger file is appended with plain `appendFileSync` (ctx.fs has no
  append operation; the Append precedent).
- Reverting an absent pre-image file unlinks it through `node:fs`
  (ctx.fs has no delete operation); every *write* goes through the
  factory's shared version-fenced executor.
