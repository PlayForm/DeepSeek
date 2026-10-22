# SCHEME - @playform/hook-dsh-workspace-merge

## Service surface (`ctx.workspaceMerge`)

| Method | Returns | Notes |
| --- | --- | --- |
| `preview(batch)` | `Promise<Preview>` | the gates + the digest; no write |
| `commit(batch)` | `Promise<Commit>` | the gates + the per-file commits |
| `batch(id)` | `Record \| undefined` | one recorded batch |
| `batches()` | `Record[]` | all recorded batches |
| `statistics()` | `Statistics` | `{ batches, applied, conflicts, rejected, recovery, sequence }` |

## The types

- `Batch` - `{ id?, operations: Operation[] }`; `Operation` =
  `{ path, content, version }` (content is the file's full new text;
  the fence is mandatory).
- `Reply` (the commit reply union) - `{ path, status, version?, expected?,
  observed?, reason? }` with `status` in `applied | conflict | denied |
  rejected | recovery-required | outcome-unknown` (the v4.1 edit lifecycle's
  verified / recovery-required / conflict / denied, plus the batch-level
  rejected and the honest outcome-unknown).
- `Commit` - `{ id, status: "applied" | "partial" | "rejected", replies,
  reason? }`.
- `Preview` - `{ id, ok, files: [{path, expected, observed, bytes, status}],
  digest, reason? }`; the digest is the SHA-256 (hex) of the joined
  intended contents.

## The gates (in evaluation order)

1. empty batch
2. `maxFiles`
3. `maxTotalBytes`
4. duplicate paths
5. a missing version fence
6. per file: unresolved path (reject) / fence mismatch (conflict)

In all-or-nothing mode any gate failure or conflict rejects the whole
batch; in survivors mode conflicts and per-file failures are replies.

## Config

| Field | Type | Default |
| --- | --- | --- |
| `enabled` | boolean | `false` |
| `domain` | string | `workspace_merge` |
| `mode` | `"all-or-nothing" \| "survivors"` | `all-or-nothing` |
| `maxFiles` | number | `50` |
| `maxTotalBytes` | number | `1000000` |
| `logFile` | string | `~/.dsh/merge.log` |

All volatile. Invalid config fails loud at load.

## Storage layout (domain `workspace_merge`, version 1, per-record)

- `batches` - one record per batch, keyed by the batch id.
- `meta` - one record `__meta`: `{ sequence }`.
