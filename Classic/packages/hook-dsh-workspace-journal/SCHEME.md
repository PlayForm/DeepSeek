# SCHEME - @playform/hook-dsh-workspace-journal

The formal scheme of the workspace-journal hook: the domain schema, the record shapes, the
lifecycle, and the ledger lines.

## 1. The storage domain

One KV domain, named config `domain` (default `workspace_journal`), version 1, layout `per-record`,
`invalidRecords: backup-and-skip`, three tables:

| Table     | Key                        | Record                                    |
| --------- | -------------------------- | ----------------------------------------- |
| `batches` | `batchId`                  | BatchRecord                               |
| `entries` | `` `${batchId}:${path}` `` | EntryRecord (the revert data)             |
| `ring`    | `__ring`                   | `string[]` - the bounded ring of batchIds |

An absent `storageDomain` facility is a silent skip: the records live in memory only. A failed open
is loud: one `storage open failed: <reason>` ledger line, never rethrown.

## 2. BatchRecord

```ts
{
  batchId: string;    // the caller's transaction id
  operation: string;  // e.g. "workspace.commit"
  parent: string;     // the parent operation id ("" at the top)
  state: "applying" | "verified" | "recovery-required" | "reverted";
  files: string[];    // the ordered file paths
  progress: number;   // writes observed against the open batch
  reason: string;     // why recovery-required ("" otherwise)
  at: number;         // epoch ms when opened
}
```

## 3. EntryRecord (the revert data)

```ts
{
	batchId: string;
	path: string;
	state: "present" | "absent"; // absent ⇒ revert removes the file
	version: string; // the version token observed before the write
	content: string; // the pre-image ("" when truncated)
	truncated: boolean; // pre-image over maxEntryBytes
	at: number;
}
```

## 4. The lifecycle

```
open(batch, entries)   → state "applying", entries persisted
  (the merge's writes go through the factory's executor here)
seal(id, "verified")   → terminal; the batch closed cleanly
crash between          → state stays "applying"; at the next boot
                         recover() marks "recovery-required" with
                         identity + progress (the honest all-or-nothing)
revert(id)             → replay backward (reverse file order):
                         present  → replaceIfVersion write-back
                                    (fence ok | conflict | skipped)
                         absent   → unlink (removed)
                         terminal state "reverted"
```

## 5. The ledger lines (module-owned, byte-stable)

```
disabled (enabled=false)
activated (domain=<domain>, maxBatches=<n>)
opened <batchId> (<n> files)
sealed <batchId> verified
sealed <batchId> recovery-required (<reason>)
seal failed <batchId> (unknown batch)
seal failed <batchId> (state <state>, not applying)
observed <path> in <batchId> (progress <n>)
reverted <batchId> (<n> files)
reverted <batchId> <path> (removed)
reverted <batchId> <path> (already absent)
reverted <batchId> <path> (fence ok)
reverted <batchId> <path> (conflict: version fence failed)
reverted <batchId> <path> (conflict: file now absent, expected content)
reverted <batchId> <path> (skipped: pre-image over maxEntryBytes)
reverted <batchId> <path> (skipped: <reason>)
revert failed <batchId> (unknown batch)
revert failed <batchId> (state <state>, not reversible)
recovery-required <batchId> (<reason>)
capped <batchId> (maxBatches <n>)
ignored <path> (own actor)
ignored <path> (excluded)
failed <path> (<reason>)
storage open failed: <reason>
```

Every line is prefixed by the factory's Append with the module identity (`journal: `). The strings
live in the modules (the factory never owns them) and are renamed mechanically, never edited ad hoc.
