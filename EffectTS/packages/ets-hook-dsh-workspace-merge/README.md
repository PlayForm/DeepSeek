# @playform/hook-dsh-workspace-merge

The batch merge of the workspace family: the **atomic gates**, the per-file
commits **through the factory's Write executor**, and the **commit reply
union**. Plan: `Documentation/Plans/Workspace-Family/MERGE.md` +
`Documentation/Plans/WORKSPACE-FAMILY-V4-1.md` (sections 3.7-3.8).

## What it does

- Registers the `workspaceMerge` service (`preview`, `commit`, `batch`,
  `batches`, `statistics`).
- Registers one tool from apply (`workspace_merge`) - the tool lives inside
  its owning hook.
- Runs the atomic gates before any write: empty batch, maxFiles,
  maxTotalBytes, duplicate paths, missing version fences, unresolved paths,
  stale fences.
- Commits file by file through `pluginFactory.Write` with the explicit
  `replaceIfVersion` intent, the P4 sandbox fence, and the root-context
  `fs/observed` emit; every applied write is verified by reading the file
  back and comparing it to the intended content.
- Reports the commit reply union per file: `applied`, `conflict` (expected
  and observed versions attached), `denied`, `rejected`,
  `recovery-required`, `outcome-unknown` - derived from the v4.1 edit
  lifecycle, never guessed.
- Persists every batch record in its own KV domain (`workspace_merge`) -
  the journal the recovery domain reads later.

## The atomicity semantics

- **all-or-nothing** (default): any gate failure rejects the whole batch; a
  mid-batch write failure stops the batch and marks the remaining files
  `recovery-required` - recoverable partial states, never an invisible
  intermediate state.
- **survivors**: gate conflicts and per-file failures are per-file replies;
  the batch continues.

## What it does not do

- No three-way merge in v1: preview, version fence, and an explicit
  conflict only (W4.1 section 3.8).
- No unconditional write: every operation needs a version fence.
- No wall clocks: ids and sequences are the hook's own monotonic counter.

## Ledger lines (byte-stable, module-owned)

```text
merge: activated (domain=<domain>, mode=<mode>)
merge: disabled (enabled=false)
merge: batch <id> started (<n> files, <bytes> bytes)
merge: batch <id> rejected (<reason>)
merge: applied <path> version <version> (batch <id>)
merge: conflict <path> (expected <e>, observed <o>)
merge: denied <path> (<reason>)
merge: recovery-required <path> (batch <id>)
merge: outcome-unknown <path> (batch <id>)
merge: batch <id> complete (applied <a>, conflict <c>, denied <d>, recovery <r>, unknown <u>)
merge: storage open failed: <reason>
```

## Status

The plugin ships **disabled** (`enabled: false` - the IDLE-forever posture);
it enables only by an explicit ACTIVATE. This is the PoC build: the smoke
suite and the ETS twin land at the end phase.
