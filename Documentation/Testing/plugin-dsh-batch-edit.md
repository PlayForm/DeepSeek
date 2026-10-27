# plugin-dsh-batch-edit - the live test plan

## Identity

- Package: `@playform/plugin-dsh-batch-edit` (Classic/packages/plugin-dsh-batch-edit).
- Profile row id: `plugin-dsh-batch-edit` (bundled in the desktop profile).
- Exposes the `batch_edit` tool, which opens a machine, inserts files as PROCESSES, and runs the
  transition table (replace / insert-after / insert-before / remove-line / append / prepend) across
  every held file in one go. Every write goes through Factory.Write, and governed basenames run the
  direct path of the factory exactly once per write (the govern actor marker, Gate.ts route 2). The
  atomic gate is all-or-nothing.
- Ledger lines (SCHEME §6, byte-stable): the activation proof
  `` `activated bundle <version> (...)` `` (with the config summary), the machine/transition
  contract lines (`machine opened <id> (<n> files, scope=<glob>)`,
  `transition applied <file> version <old> -> <new>`, `machine committed <id> (...)`,
  `machine closed <id>`), and the policy refusal `` `apply refused <id> (policy write=approve)` ``;
  logFile `~/.dsh/playform/plugin-dsh-batch-edit.log`.
- The policy block (D6, SCHEME §5 step 0 / README "The policy block"): the config carries the shared
  per-action allowlist (`policy: Policy()`, mapped to `State.Allow`; write/commit/spawn = `approve`,
  read/index/record/suggest/message = `auto`). The `commit` action consults
  `Decide(State.Allow, "write")` BEFORE any plan or write, so the shipped default refuses the apply
  until the user approves (flip `policy.write` to `auto`, or approve the batch through the
  batch-decision hook). One volatile object stays hot-editable, and a resolved pack's `policy`
  section overrides per action.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/plugin-dsh-batch-edit"}` for one entry with status schema (defaults:
    machinesPerAgent 2, opsPerCommit 64, deadlineMs 120000, strictMode false, interceptBash false,
    monitorChecksets [], policy.* D6 defaults).

    The package ships disabled (`enabled: false`) and enables only by an explicit ACTIVATE in the
    profile.

2. **The tool check.**

    The Tool provider lists `batch_edit`.

3. **The ledger line.**

    The `activated bundle ...` line appears in `~/.dsh/playform/plugin-dsh-batch-edit.log`.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the defaults match | | T2 | `batch_edit` open on a /tmp scratch file | the
machine opens, the file is held | the file appears as a PROCESS | | T2 | Commit a replace op on the
/tmp file with `policy.write` = `approve` (the shipped default) | the apply is refused, nothing is
read or written, the machine stays open with its cells `observed` | the byte-exact
`apply refused <id> (policy write=approve)` line is in the ledger AND the thrown error | | T2 | Flip
`policy.write` to `auto` (hot edit, no remount), then commit the same op | the atomic commit applies
| the diff is exact; all-or-nothing | | T2 | A commit exceeding deadlineMs 120000 | one
`batch-edit-continue` job via the jobs hub | `jobId` in the output; no plugin-owned timers | | T2 |
A held file touched externally before commit | the cell flips to `halted("stale")`, machine stays
open | resume with `action=commit` on the same machine |

## Known live gaps

- None known: the former `cannot get property "fs" without inject` defect is FIXED (the inject list
  is `["pluginFactory", "tools", "jobs"]` and the tool runs). The current operational posture to
  test: with the shipped `write: approve` policy a commit is refused (the apply gate, by design)
  until the user approves, which is not a defect. Still open per SCHEME §9 (FUTURE): the
  bash-intercept enforcement layer (v1 `interceptBash` is advisory only), the undo journal, and the
  interactive confirmation checkpoints.

## Fix loop

- Fix files: `Source/Library.ts` (the loader contract, inject `["pluginFactory", "tools", "jobs"]`),
  `Source/Function/Machine.ts`, `Source/Function/Ops.ts`, `Source/Function/Tools.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-batch-edit run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-batch-edit/Target/Test/<Folder>/Test.js`
  (Machine-And-Contract, Commit-And-Ops, Observers-And-Waterfalls) must stay green, then restart the
  app.

## Report stub

- Plugin: `@playform/plugin-dsh-batch-edit`
- Tests run: T1 config - / T2 open - / T2 policy refusal - / T2 commit after approve - / T2 deadline
  job - / T2 stale halt -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
