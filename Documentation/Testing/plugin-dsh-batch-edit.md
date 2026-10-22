# plugin-dsh-batch-edit - the live test plan

## Identity
- Package: `@playform/plugin-dsh-batch-edit`
  (Classic/packages/plugin-dsh-batch-edit).
- Profile row id: `plugin-dsh-batch-edit` (bundled in the desktop profile).
- Exposes: the `batch_edit` tool - opens a machine, inserts files as PROCESSES,
  runs the transition table (replace / insert-after / insert-before /
  remove-line / append / prepend) across every held file in one go. Every write
  goes through Factory.Write; governed basenames run the factory's direct path
  exactly once per write (the govern actor marker, Gate.ts route 2). The atomic
  gate is all-or-nothing.
- Ledger line: `` `activated bundle ${Version} (machinesPerAgent ${State.MachinesPerAgent}, opsPerCommit ${State.OpsPerCommit}, deadlineMs ${State.Deadline}, strictMode ${State.Strict}, interceptBash ${State.Intercept})` ``
  (Apply.ts:154); logFile `~/.dsh/batch-edit.log`.

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-batch-edit"}` → one entry, status schema
   (defaults: machinesPerAgent 2, opsPerCommit 64, deadlineMs 120000,
   strictMode false, interceptBash false, monitorChecksets []).
2. Tool check: the Tool provider lists `batch_edit`.
3. Ledger line: the `activated bundle ...` line in `~/.dsh/batch-edit.log`.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the defaults match |
| T2 | `batch_edit` open on a /tmp scratch file | the machine opens, the file is held | the file appears as a PROCESS |
| T2 | Commit a replace op on the /tmp file | the atomic commit applies | the diff is exact; all-or-nothing |
| T1 | Any batch_edit call | **KNOWN FAILURE**: `cannot get property "fs" without inject` | currently every call fails - see the gap |

## Known live gaps
- **Fails every call** with `cannot get property "fs" without inject`. The
  inject list is `["pluginFactory", "tools", "jobs"]` but `Machine.ts:223`,
  `Ops.ts:235` and `Tools.ts:283` read `State.Context.fs`. The fix: add `"fs"`
  to the inject array + rebuild (`Source/Library.ts`), then restart the app and
  re-run T2.

## Fix loop
- Fix files: `Source/Library.ts` (the inject list), `Source/Function/Machine.ts`,
  `Source/Function/Ops.ts`, `Source/Function/Tools.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-batch-edit run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-batch-edit/Target/Test/<Folder>/Test.js`
  (Machine-And-Contract, Commit-And-Ops, Observers-And-Waterfalls) must stay
  green. Then the app restart.

## Report stub
- Plugin: `@playform/plugin-dsh-batch-edit`
- Tests run: T1 config - / T2 open - / T2 commit - (blocked by the fs gap)
- Defects: Source/Library.ts - inject list lacks "fs" - add "fs" and rebuild
- Rebuild/smoke: -
- Residuals: -
