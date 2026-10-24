# hook-dsh-workspace-journal - the live test plan

## Identity

- Package: `@playform/hook-dsh-workspace-journal` (Classic/packages/hook-dsh-workspace-journal).
- Profile row id: `hook-dsh-workspace-journal` (bundled in the desktop profile).
- Exposes: no tools - it records the workspace's evidence: the per-batch BatchRecords (state
  `applying | verified | recovery-required | reverted`), the revert data (the per-file EntryRecords:
  present/absent, version, pre-image content, `truncated`), and the crash recovery (JOURNAL.md; V4-1
  sections 3.7-3.8). Lifecycle: `open(batch, entries)` → `seal(id, "verified")` → `revert(id)`
  replays backward (reverse file order; present → replaceIfVersion write-back with the fence
  verdicts, absent → unlink); a crash between commit and seal leaves `applying`, and `recover()`
  marks `recovery-required` with identity + progress - the honest all-or-nothing, so a crash is
  never an invisible intermediate state.
- Ledger: logFile `~/.dsh/playform/hook-dsh-workspace-journal.log`; KV domain `workspace_journal`
  (version 1, per-record, `invalidRecords: backup-and-skip`; tables `batches` by batchId, `entries`
  by `${batchId}:${path}`, `ring` meta `__ring` the bounded batchId ring); ring bound maxBatches
  200; maxEntryBytes 65536. Every line is prefixed by the factory's Append with the module identity
  (`journal: `).

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-workspace-journal"}` → one entry, status schema (defaults: domain
   workspace_journal, maxBatches 200, maxEntryBytes 65536, exclude triple, and the `policy` D6
   block).
2. Service check: none expected (no service; a listener hook).
3. Ledger line: `journal: activated (domain=workspace_journal, maxBatches=200)` in
   `~/.dsh/playform/hook-dsh-workspace-journal.log`; a cold mount logs
   `journal: disabled (enabled=false)`.

## Test cases

- T1 listConfigs query above - one entry, `status: "schema"` - the defaults match.
- T2 Run a batch_edit commit on /tmp scratch files - one journal record BEFORE the writes land -
  pre-images (revert data) captured per file; the log shows `journal: opened <batchId> (<n> files)`,
  then `journal: observed <path> in <batchId> (progress <n>)`, then
  `journal: sealed <batchId> verified`.
- T2 Include a file whose pre-image exceeds maxEntryBytes - the entry is truncated (`truncated`
  true, content `""`); replay skips it - the log shows
  `journal: reverted <batchId> <path> (skipped: pre-image over maxEntryBytes)`; never half-applied.
- T3 Simulate a crash between commit and seal (kill the flow) - recovery finds a recoverable partial
  state - `journal: recovery-required <batchId> (<reason>)` with progress at the next boot; no
  invisible intermediate state.
- T4 Revert a sealed batch - backward replay - the log shows per-file
  `journal: reverted <batchId> <path> (fence ok)` / `(removed)` / `(already absent)` /
  `(conflict: version fence failed)` / `(conflict: file now absent, expected content)`, then
  `journal: reverted <batchId> (<n> files)`.
- T5 Policy hold on the revert - the revert is the hook's ONE gated action (it writes pre-images
  back) - with `policy.write=approve` the log records the byte-exact
  `journal: revert held (<n> files) (policy write=approve)` line, refuses with
  `batch <id> is held by the policy (write=approve)`, performs zero writes, keeps the batch's state
  and persists no record; the batch stays reversible. `auto` proceeds.
- T6 Ring bound - the oldest batch is evicted at maxBatches - the log shows
  `journal: capped <batchId> (maxBatches <n>)`.

## Known live gaps

- Not dogfooded yet. Watch for: pre-images recorded AFTER the write (ordering bug) and truncated
  replays being applied partially.
- The revert-held line is the one new byte-exact policy line to check live.

## Fix loop

- Fix files: `Source/Function/` (the journal writer, the recovery), `Source/Library.ts`,
  `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-workspace-journal run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-workspace-journal/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/hook-dsh-workspace-journal`
- Tests run: T1 config - / T2 pre-image - / T2 truncation - / T3 recovery - / T4 revert - / T5
  policy hold - / T6 ring -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
