# hook-dsh-workspace-journal - the live test plan

## Identity
- Package: `@playform/hook-dsh-workspace-journal`
  (Classic/packages/hook-dsh-workspace-journal).
- Profile row id: `hook-dsh-workspace-journal` (bundled in the desktop profile).
- Exposes: no tools - it records the workspace's evidence: the per-batch
  records, the revert data (the per-file pre-images), and the crash recovery
  (JOURNAL.md; V4-1 sections 3.7-3.8). The batch is journaled BEFORE its writes
  land, so a crash between commit and seal is never an invisible intermediate
  state.
- Ledger: logFile `~/.dsh/workspace-journal.log`; KV domain
  `workspace_journal`; ring bound maxBatches 200; maxEntryBytes 65536.

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-workspace-journal"}` → one entry, status
   schema (defaults: domain workspace_journal, maxBatches 200, maxEntryBytes
   65536, exclude triple).
2. Service check: none expected (no service; a listener hook).
3. Ledger line: the activated line in `~/.dsh/workspace-journal.log`; a cold
   mount logs `disabled (enabled=false)`.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the defaults match |
| T2 | Run a batch_edit commit on /tmp scratch files | one journal record BEFORE the writes land | pre-images (revert data) captured per file |
| T2 | Include a file whose pre-image exceeds maxEntryBytes | the entry is truncated; replay skipped with a ledger line | never half-applied |
| T3 | Simulate a crash between commit and seal (kill the flow) | recovery finds a recoverable partial state | no invisible intermediate state |

## Known live gaps
- Not dogfooded yet. Watch for: pre-images recorded AFTER the write (ordering
  bug) and truncated replays being applied partially.

## Fix loop
- Fix files: `Source/Function/` (the journal writer, the recovery),
  `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-workspace-journal run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-workspace-journal/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/hook-dsh-workspace-journal`
- Tests run: T1 config - / T2 pre-image - / T2 truncation - / T3 recovery -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
